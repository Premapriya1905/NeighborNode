import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema({
  // Parties
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Booking Details
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },

  // Status Flow
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
    index: true
  },

  // Pricing
  agreedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Communication
  customerNote: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    trim: true
  },
  providerNote: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    trim: true
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    trim: true
  },

  // Timestamps for status changes
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },

  // Post-Service
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });

// Virtual to check if booking is past
bookingSchema.virtual('isPast').get(function() {
  return new Date() > this.scheduledDate;
});

// Virtual to check if booking can be reviewed
bookingSchema.virtual('canBeReviewed').get(function() {
  return this.status === BOOKING_STATUS.COMPLETED && !this.isReviewed;
});

// Static method to get user's bookings
bookingSchema.statics.getUserBookings = function(userId, asCustomer = true) {
  const filter = asCustomer ? { customerId: userId } : { providerId: userId };
  return this.find(filter)
    .populate('serviceId', 'images pricing category subcategory')
    .populate('providerId', 'firstName lastName displayName profileImage rating')
    .populate('customerId', 'firstName lastName displayName profileImage rating')
    .sort({ scheduledDate: -1 });
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcomingBookings = function(userId) {
  return this.find({
    $or: [
      { customerId: userId },
      { providerId: userId }
    ],
    scheduledDate: { $gte: new Date() },
    status: { $in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CONFIRMED] }
  })
  .populate('serviceId', 'images')
  .populate('providerId', 'firstName lastName displayName profileImage')
  .populate('customerId', 'firstName lastName displayName profileImage')
  .sort({ scheduledDate: 1 });
};

// Instance method to accept booking
bookingSchema.methods.accept = async function() {
  this.status = BOOKING_STATUS.ACCEPTED;
  this.acceptedAt = new Date();
  return await this.save();
};

// Instance method to reject booking
bookingSchema.methods.reject = async function(reason) {
  this.status = BOOKING_STATUS.REJECTED;
  this.rejectedAt = new Date();
  this.cancellationReason = reason;
  return await this.save();
};

// Instance method to complete booking
bookingSchema.methods.complete = async function() {
  this.status = BOOKING_STATUS.COMPLETED;
  this.completedAt = new Date();
  
  // Update provider's completed bookings count
  await mongoose.model('User').findByIdAndUpdate(
    this.providerId,
    { $inc: { bookingsCompleted: 1 } }
  );
  
  // Update service bookings count
  await mongoose.model('Service').findByIdAndUpdate(
    this.serviceId,
    { $inc: { bookings: 1 } }
  );
  
  return await this.save();
};

// Instance method to cancel booking
bookingSchema.methods.cancel = async function(reason) {
  this.status = BOOKING_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return await this.save();
};

// Pre-save hook to validate status transitions
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const validTransitions = {
      [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.COMPLETED]: [],
      [BOOKING_STATUS.REJECTED]: [],
      [BOOKING_STATUS.CANCELLED]: []
    };

    const oldStatus = this._original?.status || BOOKING_STATUS.PENDING;
    const newStatus = this.status;

    if (oldStatus !== newStatus && !validTransitions[oldStatus]?.includes(newStatus)) {
      return next(new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`));
    }
  }
  next();
});

// Store original document for validation
bookingSchema.post('init', function() {
  this._original = this.toObject();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
