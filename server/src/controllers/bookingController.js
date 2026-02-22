import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { BOOKING_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * @desc    Create booking request
 * @route   POST /api/v1/bookings
 * @access  Private
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, scheduledDate, scheduledTime, customerNote, duration } = req.body;

  // Get service details
  const service = await Service.findById(serviceId).populate('providerId');

  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  if (!service.isActive || !service.isApproved) {
    throw ApiError.badRequest('Service is not available for booking');
  }

  // Prevent self-booking
  if (service.providerId._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot book your own service');
  }

  // Create booking
  const booking = await Booking.create({
    serviceId,
    providerId: service.providerId._id,
    customerId: req.user._id,
    scheduledDate,
    scheduledTime,
    duration: duration || 60,
    agreedPrice: service.pricing.amount,
    currency: service.pricing.currency,
    customerNote
  });

  // Populate references
  await booking.populate([
    { path: 'serviceId', select: 'title images pricing category' },
    { path: 'providerId', select: 'firstName lastName displayName profileImage' },
    { path: 'customerId', select: 'firstName lastName displayName profileImage' }
  ]);

  // Create notification for provider
  await Notification.createNotification({
    userId: service.providerId._id,
    type: NOTIFICATION_TYPES.BOOKING_REQUEST,
    title: 'New Booking Request',
    message: `${req.user.displayName} wants to book your service "${service.title}"`,
    relatedId: booking._id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking._id}`
  });

  ApiResponse.created(res, booking, 'Booking request created successfully');
});

/**
 * @desc    Get user's bookings
 * @route   GET /api/v1/bookings
 * @access  Private
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const { asProvider, status, page = 1, limit = 10 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  // Build query
  const query = asProvider === 'true'
    ? { providerId: req.user._id }
    : { customerId: req.user._id };

  if (status) {
    query.status = status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('serviceId', 'title images pricing category')
      .populate('providerId', 'firstName lastName displayName profileImage rating')
      .populate('customerId', 'firstName lastName displayName profileImage rating')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Booking.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    bookings,
    page,
    parsedLimit,
    total,
    'Bookings retrieved successfully'
  );
});

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('serviceId', 'title description images pricing category location')
    .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident')
    .populate('customerId', 'firstName lastName displayName profileImage rating verifiedResident');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check access
  const userId = req.user._id.toString();
  if (
    booking.customerId._id.toString() !== userId &&
    booking.providerId._id.toString() !== userId &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view this booking');
  }

  ApiResponse.success(res, booking, 'Booking retrieved successfully');
});

/**
 * @desc    Accept booking (Provider only)
 * @route   PATCH /api/v1/bookings/:id/accept
 * @access  Private
 */
export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'displayName')
    .populate('serviceId', 'title');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify provider
  if (booking.providerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the service provider can accept this booking');
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot accept booking with status: ${booking.status}`);
  }

  await booking.accept();

  // Create notification for customer
  await Notification.createNotification({
    userId: booking.customerId._id,
    type: NOTIFICATION_TYPES.BOOKING_ACCEPTED,
    title: 'Booking Accepted!',
    message: `Your booking for "${booking.serviceId.title}" has been accepted`,
    relatedId: booking._id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking._id}`
  });

  ApiResponse.success(res, booking, 'Booking accepted successfully');
});

/**
 * @desc    Reject booking (Provider only)
 * @route   PATCH /api/v1/bookings/:id/reject
 * @access  Private
 */
export const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'displayName')
    .populate('serviceId', 'title');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify provider
  if (booking.providerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the service provider can reject this booking');
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot reject booking with status: ${booking.status}`);
  }

  await booking.reject(reason);

  // Create notification for customer
  await Notification.createNotification({
    userId: booking.customerId._id,
    type: NOTIFICATION_TYPES.BOOKING_REJECTED,
    title: 'Booking Declined',
    message: `Your booking for "${booking.serviceId.title}" has been declined`,
    relatedId: booking._id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking._id}`
  });

  ApiResponse.success(res, booking, 'Booking rejected successfully');
});

/**
 * @desc    Complete booking
 * @route   PATCH /api/v1/bookings/:id/complete
 * @access  Private
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'displayName')
    .populate('serviceId', 'title');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify provider
  if (booking.providerId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the service provider can complete this booking');
  }

  await booking.complete();

  // Create notification for customer
  await Notification.createNotification({
    userId: booking.customerId._id,
    type: NOTIFICATION_TYPES.BOOKING_COMPLETED,
    title: 'Service Completed',
    message: `Your booking for "${booking.serviceId.title}" is complete. Please leave a review!`,
    relatedId: booking._id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking._id}/review`
  });

  ApiResponse.success(res, booking, 'Booking completed successfully');
});

/**
 * @desc    Cancel booking
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'displayName')
    .populate('providerId', 'displayName')
    .populate('serviceId', 'title');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify user is involved
  const userId = req.user._id.toString();
  if (
    booking.customerId._id.toString() !== userId &&
    booking.providerId._id.toString() !== userId
  ) {
    throw ApiError.forbidden('Not authorized to cancel this booking');
  }

  await booking.cancel(reason);

  // Notify the other party
  const otherPartyId = booking.customerId._id.toString() === userId
    ? booking.providerId._id
    : booking.customerId._id;

  await Notification.createNotification({
    userId: otherPartyId,
    type: NOTIFICATION_TYPES.BOOKING_REJECTED,
    title: 'Booking Cancelled',
    message: `Booking for "${booking.serviceId.title}" has been cancelled`,
    relatedId: booking._id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking._id}`
  });

  ApiResponse.success(res, booking, 'Booking cancelled successfully');
});

/**
 * @desc    Get upcoming bookings
 * @route   GET /api/v1/bookings/upcoming
 * @access  Private
 */
export const getUpcomingBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.getUpcomingBookings(req.user._id);

  ApiResponse.success(res, bookings, 'Upcoming bookings retrieved successfully');
});
