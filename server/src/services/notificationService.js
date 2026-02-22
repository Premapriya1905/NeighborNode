import Notification from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

class NotificationService {
  async createNotification(data) {
    try {
      return await Notification.create(data);
    } catch (error) {
      console.error('Notification creation failed:', error);
      throw error;
    }
  }

  async notifyBookingRequest(booking, customer) {
    return this.createNotification({
      userId: booking.providerId,
      type: NOTIFICATION_TYPES.BOOKING_REQUEST,
      title: 'New Booking Request',
      message: `${customer.displayName} wants to book your service`,
      relatedId: booking._id,
      relatedType: 'booking',
      actionUrl: `/bookings/${booking._id}`
    });
  }

  async notifyBookingAccepted(booking, provider) {
    return this.createNotification({
      userId: booking.customerId,
      type: NOTIFICATION_TYPES.BOOKING_ACCEPTED,
      title: 'Booking Accepted!',
      message: `${provider.displayName} accepted your booking request`,
      relatedId: booking._id,
      relatedType: 'booking',
      actionUrl: `/bookings/${booking._id}`
    });
  }

  async notifyReviewReceived(review, reviewer, service) {
    return this.createNotification({
      userId: review.providerId,
      type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
      title: 'New Review',
      message: `${reviewer.displayName} left a ${review.rating}-star review`,
      relatedId: review._id,
      relatedType: 'review',
      actionUrl: `/services/${service._id}#reviews`
    });
  }
}

export default new NotificationService();