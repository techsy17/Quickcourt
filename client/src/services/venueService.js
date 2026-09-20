import api from './api';

export const venueService = {
  getVenues: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.sport && params.sport !== 'All') query.append('sport', params.sport);
    if (params.venueType && params.venueType !== 'All') query.append('venueType', params.venueType);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.minRating) query.append('minRating', params.minRating);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = `/facilities${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  },

  getVenueById: async (id) => {
    return await api.get(`/facilities/${id}`);
  },

  addReview: async (id, reviewData) => {
    return await api.post(`/facilities/${id}/reviews`, reviewData);
  },
};

export default venueService;
