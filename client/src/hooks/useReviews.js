import { useState, useCallback } from 'react';
import api from '../services/api';

const useReviews = (serviceId) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!serviceId) return;

    setIsLoading(true);
    try {
      const response = await api.get(`reviews/service/${serviceId}`);
      setReviews(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  // Create review
  const createReview = useCallback(async (reviewData) => {
    setIsLoading(true);
    try {
      const response = await api.post(`reviews/${serviceId}`, reviewData);
      setReviews((prev) => [response.data, ...prev]);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create review';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  // Update review
  const updateReview = useCallback(async (reviewId, updateData) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`reviews/${reviewId}`, updateData);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? response.data : r))
      );
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update review';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete review
  const deleteReview = useCallback(async (reviewId) => {
    setIsLoading(true);
    try {
      await api.delete(`reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete review';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark as helpful
  const markHelpful = useCallback(async (reviewId) => {
    try {
      const response = await api.post(`reviews/${reviewId}/helpful`);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? response.data : r))
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to mark as helpful');
    }
  }, []);

  return {
    reviews,
    isLoading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful
  };
};

export default useReviews;
