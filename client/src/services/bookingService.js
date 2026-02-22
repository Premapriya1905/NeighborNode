import api from './api';

class BookingService {
  async createBooking(bookingData) {
    return await api.post('bookings', bookingData);
  }

  async getMyBookings(params = {}) {
    return await api.get('bookings', { params });
  }

  async getBookingById(id) {
    return await api.get(`bookings/${id}`);
  }

  async acceptBooking(id) {
    return await api.patch(`bookings/${id}/accept`);
  }

  async rejectBooking(id, reason) {
    return await api.patch(`bookings/${id}/reject`, { reason });
  }

  async completeBooking(id) {
    return await api.patch(`bookings/${id}/complete`);
  }

  async cancelBooking(id, reason) {
    return await api.patch(`bookings/${id}/cancel`, { reason });
  }
}

export default new BookingService();