import Service from '../models/Service.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, buildSearchQuery } from '../utils/helpers.js';

/**
 * @desc    Advanced service search
 * @route   GET /api/v1/search/services
 * @access  Public
 */
export const searchServices = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    rating,
    street,
    buildingName,
    tags,
    sortBy = 'relevance',
    page = 1,
    limit = 12
  } = req.query;

  const { skip, limit: parsedLimit } = getPagination(page, limit);

  // Build query
  const query = {
    isActive: true,
    isApproved: true
  };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    query['pricing.amount'] = {};
    if (minPrice) query['pricing.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.amount'].$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Location filters
  if (street) {
    query['location.street'] = new RegExp(street, 'i');
  }
  if (buildingName) {
    query['location.buildingName'] = new RegExp(buildingName, 'i');
  }

  // Tags filter
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    query.tags = { $in: tagArray };
  }

  // Determine sort order
  let sort = {};
  switch (sortBy) {
    case 'price-low':
      sort = { 'pricing.amount': 1 };
      break;
    case 'price-high':
      sort = { 'pricing.amount': -1 };
      break;
    case 'rating':
      sort = { rating: -1, reviewCount: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'popular':
      sort = { views: -1, bookings: -1 };
      break;
    case 'relevance':
    default:
      if (q) {
        sort = { score: { $meta: 'textScore' } };
        query.score = { $meta: 'textScore' };
      } else {
        sort = { rating: -1, createdAt: -1 };
      }
  }

  // Execute query
  const [services, total] = await Promise.all([
    Service.find(query)
      .select(q ? { ...query } : {})
      .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident badges')
      .sort(sort)
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
    'Services retrieved successfully'
  );
});

/**
 * @desc    Search users
 * @route   GET /api/v1/search/users
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const {
    q,
    skills,
    street,
    buildingName,
    minRating,
    page = 1,
    limit = 20
  } = req.query;

  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    isVerified: true
  };

  // Text search on name
  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { displayName: { $regex: q, $options: 'i' } }
    ];
  }

  // Skills filter
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
    query.skills = { $in: skillsArray };
  }

  // Location filters
  if (street) {
    query['location.street'] = new RegExp(street, 'i');
  }
  if (buildingName) {
    query['location.buildingName'] = new RegExp(buildingName, 'i');
  }

  // Rating filter
  if (minRating) {
    query.rating = { $gte: parseFloat(minRating) };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName displayName profileImage rating verifiedResident badges location skills servicesPosted')
      .sort({ rating: -1, servicesPosted: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    User.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    users,
    page,
    parsedLimit,
    total,
    'Users retrieved successfully'
  );
});

/**
 * @desc    Get search suggestions (autocomplete)
 * @route   GET /api/v1/search/suggestions
 * @access  Public
 */
export const getSuggestions = asyncHandler(async (req, res) => {
  const { q, type = 'all' } = req.query;

  if (!q || q.length < 2) {
    return ApiResponse.success(res, [], 'Query too short');
  }

  const suggestions = [];

  // Service title suggestions
  if (type === 'all' || type === 'services') {
    const services = await Service.find({
      category: { $regex: q, $options: 'i' },
      isActive: true,
      isApproved: true
    })
      .select('category subcategory')
      .limit(5)
      .lean();

    suggestions.push(
      ...services.map(s => ({
        type: 'service',
        text: s.subcategory ? `${s.category} - ${s.subcategory}` : s.category,
        category: s.category
      }))
    );
  }

  // Category suggestions
  if (type === 'all' || type === 'categories') {
    const { SERVICE_CATEGORIES } = await import('../config/constants.js');
    const matchingCategories = SERVICE_CATEGORIES.filter(cat =>
      cat.toLowerCase().includes(q.toLowerCase())
    );
    suggestions.push(
      ...matchingCategories.map(cat => ({
        type: 'category',
        text: cat
      }))
    );
  }

  // User suggestions
  if (type === 'all' || type === 'users') {
    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ],
      isVerified: true
    })
      .select('displayName profileImage')
      .limit(3)
      .lean();

    suggestions.push(
      ...users.map(u => ({
        type: 'user',
        text: u.displayName,
        avatar: u.profileImage
      }))
    );
  }

  ApiResponse.success(res, suggestions.slice(0, 10), 'Suggestions retrieved successfully');
});

/**
 * @desc    Get popular searches
 * @route   GET /api/v1/search/popular
 * @access  Public
 */
export const getPopularSearches = asyncHandler(async (req, res) => {
  // Get most common categories
  const popularCategories = await Service.aggregate([
    {
      $match: { isActive: true, isApproved: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);

  // Get most common tags
  const popularTags = await Service.aggregate([
    {
      $match: { isActive: true, isApproved: true }
    },
    {
      $unwind: '$tags'
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        tag: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);

  ApiResponse.success(
    res,
    {
      categories: popularCategories,
      tags: popularTags
    },
    'Popular searches retrieved successfully'
  );
});

/**
 * @desc    Get search filters/facets
 * @route   GET /api/v1/search/filters
 * @access  Public
 */
export const getSearchFilters = asyncHandler(async (req, res) => {
  const { street, buildingName } = req.query;

  const baseQuery = {
    isActive: true,
    isApproved: true
  };

  if (street) {
    baseQuery['location.street'] = new RegExp(street, 'i');
  }
  if (buildingName) {
    baseQuery['location.buildingName'] = new RegExp(buildingName, 'i');
  }

  // Get available categories
  const categories = await Service.distinct('category', baseQuery);

  // Get price range
  const priceRange = await Service.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$pricing.amount' },
        maxPrice: { $max: '$pricing.amount' }
      }
    }
  ]);

  // Get available tags
  const tags = await Service.aggregate([
    { $match: baseQuery },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  ApiResponse.success(
    res,
    {
      categories,
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      tags: tags.map(t => ({ tag: t._id, count: t.count }))
    },
    'Filters retrieved successfully'
  );
});