import { useState, useCallback } from 'react';
import api from '../services/api';

const useServices = () => {
  const [services, setServices] = useState([]);
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 Helper: Remove empty values before sending to backend
  const buildParams = (filters = {}) => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        params[key] = value;
      }
    });

    return params;
  };

  // Fetch all services with filters
  const fetchServices = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const safeParams = buildParams(filters); // ✅ cleaned params

      const response = await api.get('services', {
        params: safeParams,
      });

      // The axios interceptor returns response.data, so response contains { success, message, data, pagination }
      setServices(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch services error:", err);
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single service
  const fetchServiceById = useCallback(async (serviceId) => {
    setIsLoading(true);
    try {
      const response = await api.get(`services/${serviceId}`);
      setService(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create service
  const createService = useCallback(async (serviceData) => {
    setIsLoading(true);
    try {
      const response = await api.post('services', serviceData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newService = response.data;

      setServices((prev) => [newService, ...prev]);
      setError(null);
      return newService;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to create service';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update service
  const updateService = useCallback(async (serviceId, updateData) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`services/${serviceId}`, updateData);

      const updatedService = response.data;

      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? updatedService : s))
      );

      if (service?._id === serviceId) {
        setService(updatedService);
      }

      setError(null);
      return updatedService;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update service';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Delete service
  const deleteService = useCallback(async (serviceId) => {
    setIsLoading(true);
    try {
      await api.delete(`services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
      setError(null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to delete service';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (serviceId) => {
    try {
      const response = await api.post(`services/${serviceId}/favorite`);
      const updatedService = response.data;

      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? updatedService : s))
      );

      if (service?._id === serviceId) {
        setService(updatedService);
      }

      return updatedService;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || 'Failed to toggle favorite'
      );
    }
  }, [service]);

  // Search services
  const searchServices = useCallback(async (searchTerm) => {
    setIsLoading(true);
    try {
      const response = await api.get('services/search', {
        params: { q: searchTerm }
      });
      setServices(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    services,
    service,
    isLoading,
    error,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    toggleFavorite,
    searchServices
  };
};

export default useServices;