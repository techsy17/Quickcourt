import api from './api';

export const adminService = {
  // Dashboard stats
  getStats: async () => {
    return await api.get('/admin/dashboard');
  },

  // Facilities
  getAllFacilities: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    const q = query.toString();
    return await api.get(`/admin/facilities${q ? `?${q}` : ''}`);
  },

  updateFacilityStatus: async (facilityId, status, reason = '') => {
    return await api.put(`/admin/facilities/${facilityId}/status`, { status, reason });
  },

  // Users
  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    const q = query.toString();
    return await api.get(`/admin/users${q ? `?${q}` : ''}`);
  },

  updateUserStatus: async (userId, status) => {
    return await api.put(`/admin/users/${userId}/status`, { status });
  },

  // Reports
  getAllReports: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    const q = query.toString();
    return await api.get(`/admin/reports${q ? `?${q}` : ''}`);
  },

  updateReportStatus: async (reportId, status, resolution = '') => {
    return await api.put(`/admin/reports/${reportId}/status`, { status, resolution });
  },
};

export default adminService;
