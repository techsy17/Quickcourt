import api from './api';

export const ownerService = {
  getMyFacilities: async () => {
    return await api.get('/facilities/owner/my-facilities');
  },

  createFacility: async (facilityData) => {
    return await api.post('/facilities/owner/create', facilityData);
  },

  updateFacility: async (facilityId, facilityData) => {
    return await api.put(`/facilities/owner/${facilityId}`, facilityData);
  },

  getOwnerStats: async () => {
    return await api.get('/facilities/owner/stats');
  },

  // Bookings visible to the owner
  getMyBookings: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const q = query.toString();
    return await api.get(`/bookings/owner/list${q ? `?${q}` : ''}`);
  },

  updateBookingStatus: async (bookingId, status) => {
    return await api.put(`/bookings/owner/${bookingId}/status`, { status });
  },
};

export default ownerService;
