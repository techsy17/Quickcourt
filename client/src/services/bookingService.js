import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  getUserBookings: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);
    if (filters.date) query.append('date', filters.date);

    const queryString = query.toString();
    return await api.get(`/bookings/my${queryString ? `?${queryString}` : ''}`);
  },

  cancelBooking: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/cancel`);
  },

  getOwnerBookings: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);
    if (filters.date) query.append('date', filters.date);

    const queryString = query.toString();
    return await api.get(`/bookings/owner${queryString ? `?${queryString}` : ''}`);
  },

  getOwnerDashboard: async () => {
    return await api.get('/bookings/owner/dashboard');
  },
};

export default bookingService;
