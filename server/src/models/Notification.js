import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification Type
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true
  },

  // Content
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },

  // Related Entity (for navigation)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  relatedType: {
    type: String,
    enum: ['booking', 'service', 'review', 'user', 'community'],
    required: true
  },

  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },

  // Action URL (for deep linking)
  actionUrl: {
    type: String
  },

  // Metadata (for additional data)
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }

}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, limit = 20, unreadOnly = false) {
  const filter = { userId };
  if (unreadOnly) {
    filter.isRead = false;
  }
  
  return this.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

// Static helper to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Auto-delete old read notifications (older than 30 days)
notificationSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 2592000, // 30 days
  partialFilterExpression: { isRead: true }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
