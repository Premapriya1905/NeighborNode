import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import toast from 'react-hot-toast';

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    sortBy: 'date'
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getMyBookings({
        status: filters.status,
        sort: filters.sortBy
      });
      if (response.success) {
        setBookings(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch bookings';
      setError(errorMsg);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        toast.success('Booking created successfully!');
        await fetchBookings();
        return response;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create booking';
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchBookings]);

  const updateBookingStatus = useCallback(async (bookingId, status, data = {}) => {
    try {
      let response;
      switch (status) {
        case 'accept':
          response = await bookingService.acceptBooking(bookingId);
          break;
        case 'reject':
          response = await bookingService.rejectBooking(bookingId, data.reason);
          break;
        case 'complete':
          response = await bookingService.completeBooking(bookingId);
          break;
        case 'cancel':
          response = await bookingService.cancelBooking(bookingId, data.reason);
          break;
        default:
          throw new Error('Invalid status');
      }
      
      if (response.success) {
        await fetchBookings();
        return response;
      }
    } catch (err) {
      const errorMsg = err.message || `Failed to ${status} booking`;
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    filters,
    setFilters,
    fetchBookings,
    createBooking,
    updateBookingStatus
  };
};

export default useBookings;
