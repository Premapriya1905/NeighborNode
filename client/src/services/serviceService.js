import api from './api';

class ServiceService {
  // Get all services with filters
  async getServices(params = {}) {
    const response = await api.get('services', { params });
    return response;
  }

  // Get single service
  async getServiceById(id) {
    const response = await api.get(`services/${id}`);
    return response;
  }

  // Create new service
  async createService(serviceData) {
    const response = await api.post('services', serviceData);
    return response;
  }

  // Update service
  async updateService(id, serviceData) {
    const response = await api.put(`services/${id}`, serviceData);
    return response;
  }

  // Delete service
  async deleteService(id) {
    const response = await api.delete(`services/${id}`);
    return response;
  }

  // Get services by provider
  async getServicesByProvider(userId, params = {}) {
    const response = await api.get(`services/provider/${userId}`, { params });
    return response;
  }

  // Get nearby services
  async getNearbyServices(params) {
    const response = await api.get('services/nearby', { params });
    return response;
  }

  // Get popular services
  async getPopularServices(limit = 10) {
    const response = await api.get('services/popular', { params: { limit } });
    return response;
  }

  // Get categories
  async getCategories() {
    const response = await api.get('services/categories');
    return response;
  }

  // Increment views
  async incrementViews(id) {
    const response = await api.post(`services/${id}/view`);
    return response;
  }

  // Upload images
  async uploadImages(id, images) {
    const response = await api.post(`services/${id}/images`, { images });
    return response;
  }
}

export default new ServiceService();