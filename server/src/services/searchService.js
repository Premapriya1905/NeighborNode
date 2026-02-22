import Service from '../models/Service.js';
import User from '../models/User.js';

class SearchService {
  async searchServices(query, filters = {}) {
    const searchQuery = {
      isActive: true,
      isApproved: true,
      ...filters
    };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    return await Service.find(searchQuery)
      .populate('providerId', 'firstName lastName displayName profileImage rating')
      .sort({ score: { $meta: 'textScore' } })
      .lean();
  }

  async searchUsers(query, filters = {}) {
    const searchQuery = {
      isVerified: true,
      ...filters
    };

    if (query) {
      searchQuery.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ];
    }

    return await User.find(searchQuery)
      .select('firstName lastName displayName profileImage rating location skills')
      .lean();
  }

  async getAutocompleteSuggestions(query, type = 'all') {
    const suggestions = [];

    if (type === 'all' || type === 'services') {
      const services = await Service.find({
        title: { $regex: query, $options: 'i' },
        isActive: true
      })
        .select('title')
        .limit(5)
        .lean();

      suggestions.push(...services.map(s => ({ type: 'service', text: s.title })));
    }

    return suggestions;
  }
}

export default new SearchService();