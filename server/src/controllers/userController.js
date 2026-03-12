import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, sanitizeUser } from '../utils/helpers.js';

/**
 * @desc    Get user profile by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, { user: sanitizeUser(user) }, 'User retrieved successfully');
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, skills, interests, notificationPreferences } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (bio !== undefined) user.bio = bio;
  if (skills) user.skills = skills;
  if (interests) user.interests = interests;
  if (notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...notificationPreferences
    };
  }

  await user.save();

  ApiResponse.success(res, { user: sanitizeUser(user) }, 'Profile updated successfully');
});

/**
 * @desc    Update user avatar
 * @route   POST /api/v1/users/me/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw ApiError.badRequest('Image URL is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage: imageUrl },
    { new: true }
  );

  ApiResponse.success(res, { user: sanitizeUser(user) }, 'Avatar updated successfully');
});

/**
 * @desc    Get user's services
 * @route   GET /api/v1/users/:id/services
 * @access  Public
 */
export const getUserServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    providerId: req.params.id,
    isActive: true,
    isApproved: true
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
    'User services retrieved successfully'
  );
});

/**
 * @desc    Get user's reviews received
 * @route   GET /api/v1/users/:id/reviews
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const Review = (await import('../models/Review.js')).default;

  const query = {
    providerId: req.params.id,
    isApproved: true
  };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewerId', 'firstName lastName displayName profileImage')
      .populate('serviceId', 'category subcategory images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Review.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    reviews,
    page,
    parsedLimit,
    total,
    'User reviews retrieved successfully'
  );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/me
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Soft delete - deactivate services and mark user as deleted
  await Service.updateMany(
    { providerId: userId },
    { isActive: false }
  );

  await User.findByIdAndUpdate(userId, {
    isVerified: false,
    email: `deleted_${userId}@deleted.com`
  });

  ApiResponse.success(res, null, 'Account deleted successfully');
});

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/v1/users/me/preferences
 * @access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
  const { email, push, bookings, reviews } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      notificationPreferences: {
        email: email !== undefined ? email : req.user.notificationPreferences.email,
        push: push !== undefined ? push : req.user.notificationPreferences.push,
        bookings: bookings !== undefined ? bookings : req.user.notificationPreferences.bookings,
        reviews: reviews !== undefined ? reviews : req.user.notificationPreferences.reviews
      }
    },
    { new: true }
  );

  ApiResponse.success(
    res,
    { preferences: user.notificationPreferences },
    'Preferences updated successfully'
  );
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/:id/stats
 * @access  Public
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const [servicesCount, completedBookings, averageRating] = await Promise.all([
    Service.countDocuments({ providerId: userId, isActive: true, isApproved: true }),
    Booking.countDocuments({ providerId: userId, status: 'completed' }),
    User.findById(userId).select('rating totalReviews')
  ]);

  const stats = {
    servicesPosted: servicesCount,
    bookingsCompleted: completedBookings,
    rating: averageRating?.rating || 0,
    totalReviews: averageRating?.totalReviews || 0
  };

  ApiResponse.success(res, stats, 'User statistics retrieved successfully');
});

/**
 * @desc    Search users by skills
 * @route   GET /api/v1/users/search
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, skills, street, page = 1, limit = 20 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    isVerified: true
  };

  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { displayName: { $regex: q, $options: 'i' } }
    ];
  }

  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    query.skills = { $in: skillsArray };
  }

  if (street) {
    query['location.street'] = { $regex: street, $options: 'i' };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName displayName profileImage rating verifiedResident badges location skills')
      .sort({ rating: -1 })
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