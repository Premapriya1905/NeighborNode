import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const filter = { userId: req.user._id };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Notification.countDocuments(filter)
  ]);

  ApiResponse.paginated(
    res,
    notifications,
    page,
    parsedLimit,
    total,
    'Notifications retrieved successfully'
  );
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);

  ApiResponse.success(res, { count }, 'Unread count retrieved successfully');
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  await notification.markAsRead();

  ApiResponse.success(res, notification, 'Notification marked as read');
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.user._id);

  ApiResponse.success(
    res,
    { modifiedCount: result.modifiedCount },
    'All notifications marked as read'
  );
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  ApiResponse.success(res, null, 'Notification deleted successfully');
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/v1/notifications/clear-read
 * @access  Private
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    userId: req.user._id,
    isRead: true
  });

  ApiResponse.success(
    res,
    { deletedCount: result.deletedCount },
    'Read notifications cleared successfully'
  );
});

/**
 * @desc    Create notification (Admin/System)
 * @route   POST /api/v1/notifications
 * @access  Private/Admin
 */
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, relatedId, relatedType, actionUrl } = req.body;

  const notification = await Notification.createNotification({
    userId,
    type,
    title,
    message,
    relatedId,
    relatedType,
    actionUrl
  });

  ApiResponse.created(res, notification, 'Notification created successfully');
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/v1/notifications/preferences
 * @access  Private
 */
export const getPreferences = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(req.user._id).select('notificationPreferences');

  ApiResponse.success(
    res,
    user.notificationPreferences,
    'Preferences retrieved successfully'
  );
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/v1/notifications/preferences
 * @access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
  const { email, push, bookings, reviews } = req.body;

  const User = (await import('../models/User.js')).default;
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
  ).select('notificationPreferences');

  ApiResponse.success(
    res,
    user.notificationPreferences,
    'Preferences updated successfully'
  );
});