import Service from '../models/Service.js';
import fs from 'fs';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import uploadService from '../services/uploadService.js';
// The original `buildSearchQuery` from `../utils/helpers.js` was removed as per the instruction's implied change.

export const getServices = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    street,
    buildingName,
    serviceArea,
    tags,
    sortBy,
    page = 1,
    limit = 12
  } = req.query;

  // Handle sorting
  let sort = '-createdAt';

  if (sortBy === 'newest') sort = '-createdAt';
  if (sortBy === 'oldest') sort = 'createdAt';
  if (sortBy === 'price_low') sort = 'pricing.amount';
  if (sortBy === 'price_high') sort = '-pricing.amount';
  if (sortBy === 'rating') sort = '-rating';

  // Build query
  const query = {
    isActive: true
    // isApproved: true // Disabled for testing/MVP
  };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query['pricing.amount'] = {};
    if (minPrice) query['pricing.amount'].$gte = Number(minPrice);
    if (maxPrice) query['pricing.amount'].$lte = Number(maxPrice);
  }

  // Remove empty pricing filter
  if (
    query['pricing.amount'] &&
    Object.keys(query['pricing.amount']).length === 0
  ) {
    delete query['pricing.amount'];
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Location filters
  if (street) {
    query['location.street'] = new RegExp(street, 'i');
  }
  if (buildingName) {
    query['location.buildingName'] = new RegExp(buildingName, 'i');
  }
  if (serviceArea) {
    query['location.serviceArea'] = serviceArea;
  }

  // Tags filter
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagArray };
  }

  // Pagination
  const { skip, limit: parsedLimit } = getPagination(
    Number(page),
    Number(limit)
  );

  // Execute query
  const [services, total] = await Promise.all([
    Service.find(query)
      .populate(
        'providerId',
        'firstName lastName displayName profileImage rating verifiedResident badges'
      )
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Service.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    services,
    Number(page),
    parsedLimit,
    total,
    'Services retrieved successfully'
  );
});

/**
 * @desc    Get single service by ID
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident badges totalReviews bio')
    .populate({
      path: 'reviews',
      populate: {
        path: 'reviewerId',
        select: 'firstName lastName displayName profileImage'
      },
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // Increment views (don't await to improve response time)
  service.incrementViews().catch(err => console.error('View increment error:', err));

  ApiResponse.success(res, service, 'Service retrieved successfully');
});

/**
 * @desc    Create new service
 * @route   POST /api/v1/services
 * @access  Private
 */
export const createService = async (req, res, next) => {
  try {
    // Attach logged-in user as provider
    req.body.providerId = req.user._id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/v1/services/:id
 * @access  Private
 */
export const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // Check ownership
  if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this service');
  }

  // Update service
  service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('providerId', 'firstName lastName displayName profileImage rating');

  ApiResponse.success(res, service, 'Service updated successfully');
});

/**
 * @desc    Delete service
 * @route   DELETE /api/v1/services/:id
 * @access  Private
 */
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // Check ownership
  if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to delete this service');
  }

  // Soft delete by setting isActive to false
  service.isActive = false;
  await service.save();

  ApiResponse.success(res, null, 'Service deleted successfully');
});

/**
 * @desc    Get services by provider
 * @route   GET /api/v1/services/provider/:userId
 * @access  Public
 */
export const getServicesByProvider = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    providerId: req.params.userId,
    isActive: true
  };

  const [services, total] = await Promise.all([
    Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Service.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    services,
    page,
    parsedLimit,
    total,
    'Provider services retrieved successfully'
  );
});

/**
 * @desc    Get nearby services
 * @route   GET /api/v1/services/nearby
 * @access  Public
 */
export const getNearbyServices = asyncHandler(async (req, res) => {
  const { street, buildingName, limit = 20 } = req.query;

  if (!street) {
    throw ApiError.badRequest('Street is required for nearby search');
  }

  const services = await Service.getNearbyServices(buildingName, street, limit);

  ApiResponse.success(res, services, 'Nearby services retrieved successfully');
});

/**
 * @desc    Get popular/featured services
 * @route   GET /api/v1/services/popular
 * @access  Public
 */
export const getPopularServices = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const services = await Service.getPopularServices(limit);

  ApiResponse.success(res, services, 'Popular services retrieved successfully');
});

/**
 * @desc    Get service categories
 * @route   GET /api/v1/services/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Service.distinct('category', {
    isActive: true
  });

  // Get count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const count = await Service.countDocuments({
        category,
        isActive: true
        // isApproved: true 
      });
      return { category, count };
    })
  );

  ApiResponse.success(res, categoriesWithCount, 'Categories retrieved successfully');
});

/**
 * @desc    Increment service views
 * @route   POST /api/v1/services/:id/view
 * @access  Public
 */
export const incrementViews = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  await service.incrementViews();

  ApiResponse.success(res, { views: service.views }, 'View recorded');
});

/**
 * @desc    Upload service images
 * @route   POST /api/v1/services/:id/images
 * @access  Private
 */
export const uploadServiceImages = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // Check ownership
  if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this service');
  }

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Please provide images to upload');
  }

  try {
    const uploadResults = await uploadService.uploadMultipleImages(req.files, 'services');
    const imageUrls = uploadResults.map(result => result.url);

    service.images = [...service.images, ...imageUrls].slice(0, 5); // Max 5 images
    await service.save();

    // Clean up local files
    req.files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });
    });

    ApiResponse.success(res, service, 'Images uploaded successfully');
  } catch (error) {
    // Clean up local files on error
    req.files.forEach(file => {
      fs.unlink(file.path, () => { });
    });
    throw new ApiError(error.message || 'Image upload failed', 500);
  }
});

/**
 * @desc    Approve service (Admin only)
 * @route   PATCH /api/v1/services/:id/approve
 * @access  Private/Admin
 */
export const approveService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  service.isApproved = true;
  service.approvedBy = req.user._id;
  service.approvedAt = new Date();
  await service.save();

  // Create notification for provider (implement notification service)
  // await createNotification(...)

  ApiResponse.success(res, service, 'Service approved successfully');
});

/**
 * @desc    Check if service is favorited by current user
 * @route   GET /api/v1/services/:id/is-favorite
 * @access  Private
 */
export const checkIfFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const isFavorite = user.savedServices && user.savedServices.includes(req.params.id);

  ApiResponse.success(res, { isFavorite }, 'Favorite status checked');
});

/**
 * @desc    Toggle favorite status for a service
 * @route   POST /api/v1/services/:id/favorite
 * @access  Private
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  const user = await User.findById(req.user._id);

  if (!user.savedServices) {
    user.savedServices = [];
  }

  const serviceIdIndex = user.savedServices.indexOf(service._id);

  if (serviceIdIndex === -1) {
    // Add to favorites
    user.savedServices.push(service._id);
  } else {
    // Remove from favorites
    user.savedServices.splice(serviceIdIndex, 1);
  }

  await user.save({ validateBeforeSave: false });

  // Make sure to return the full service object like the frontend expects
  const populatedService = await Service.findById(req.params.id)
    .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident badges totalReviews bio')
    .populate({
      path: 'reviews',
      populate: {
        path: 'reviewerId',
        select: 'firstName lastName displayName profileImage'
      },
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  ApiResponse.success(
    res,
    populatedService,
    serviceIdIndex === -1 ? 'Service added to favorites' : 'Service removed from favorites'
  );
});
