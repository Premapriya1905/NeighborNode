import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { BOOKING_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * @desc    Create review for completed booking
 * @route   POST /api/v1/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, aspects } = req.body;

  // Get booking details
  const booking = await Booking.findById(bookingId)
    .populate('serviceId', 'title')
    .populate('providerId', 'displayName');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify booking is completed
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw ApiError.badRequest('Can only review completed bookings');
  }

  // Verify user is the customer
  if (booking.customerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the customer can review this booking');
  }

  // Check if already reviewed
  if (booking.isReviewed) {
    throw ApiError.badRequest('Booking already reviewed');
  }

  // Create review
  const review = await Review.create({
    bookingId,
    serviceId: booking.serviceId._id,
    providerId: booking.providerId._id,
    reviewerId: req.user._id,
    rating,
    title,
    comment,
    aspects
  });

  // Populate review
  await review.populate([
    { path: 'reviewerId', select: 'firstName lastName displayName profileImage' },
    { path: 'serviceId', select: 'category subcategory' }
  ]);

  // Create notification for provider
  await Notification.createNotification({
    userId: booking.providerId._id,
    type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
    title: 'New Review Received',
    message: `${req.user.displayName} left a ${rating}-star review for "${booking.serviceId.title}"`,
    relatedId: review._id,
    relatedType: 'review',
    actionUrl: `/services/${booking.serviceId._id}#reviews`
  });

  ApiResponse.created(res, review, 'Review created successfully');
});

/**
 * @desc    Get reviews for a service
 * @route   GET /api/v1/reviews/service/:serviceId
 * @access  Public
 */
export const getServiceReviews = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    serviceId,
    isApproved: true
  };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewerId', 'firstName lastName displayName profileImage')
      .sort(sort)
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
    'Reviews retrieved successfully'
  );
});

/**
 * @desc    Get reviews for a user (as provider)
 * @route   GET /api/v1/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const query = {
    providerId: userId,
    isApproved: true
  };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewerId', 'firstName lastName displayName profileImage')
      .populate('serviceId', 'title images')
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
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, aspects } = req.body;

  let review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Verify ownership
  if (review.reviewerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this review');
  }

  // Update review
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;
  if (aspects) review.aspects = { ...review.aspects, ...aspects };

  await review.save();

  await review.populate('reviewerId', 'firstName lastName displayName profileImage');

  ApiResponse.success(res, review, 'Review updated successfully');
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Verify ownership or admin
  if (
    review.reviewerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this review');
  }

  await review.deleteOne();

  ApiResponse.success(res, null, 'Review deleted successfully');
});

/**
 * @desc    Add provider response to review
 * @route   POST /api/v1/reviews/:id/response
 * @access  Private
 */
export const addProviderResponse = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Verify user is the service provider
  if (review.providerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the service provider can respond to this review');
  }

  await review.addResponse(text);

  await review.populate('reviewerId', 'firstName lastName displayName profileImage');

  ApiResponse.success(res, review, 'Response added successfully');
});

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Private
 */
export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.markHelpful(req.user._id);

  ApiResponse.success(
    res,
    { helpfulCount: review.helpfulCount },
    'Review marked as helpful'
  );
});

/**
 * @desc    Get review statistics for a service
 * @route   GET /api/v1/reviews/service/:serviceId/stats
 * @access  Public
 */
export const getReviewStats = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const stats = await Review.aggregate([
    {
      $match: {
        serviceId: new mongoose.Types.ObjectId(serviceId),
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        fiveStars: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
        },
        fourStars: {
          $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
        },
        threeStars: {
          $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
        },
        twoStars: {
          $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
        },
        oneStar: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
        }
      }
    }
  ]);

  const result = stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  };

  ApiResponse.success(res, result, 'Review statistics retrieved successfully');
});

/**
 * @desc    Flag review for moderation
 * @route   POST /api/v1/reviews/:id/flag
 * @access  Private
 */
export const flagReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isFlagged: true },
    { new: true }
  );

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  ApiResponse.success(res, null, 'Review flagged for moderation');
});