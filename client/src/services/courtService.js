import api from './api';

export const courtService = {
  getCourtsByFacility: async (facilityId) => {
    return await api.get(`/courts/facility/${facilityId}`);
  },

  getTimeSlots: async (courtId, date) => {
    return await api.get(`/courts/${courtId}/time-slots?date=${date}`);
  },

  createCourt: async (courtData) => {
    return await api.post('/courts/owner/create', courtData);
  },

  updateCourt: async (courtId, courtData) => {
    return await api.put(`/courts/owner/${courtId}`, courtData);
  },

  deleteCourt: async (courtId) => {
    return await api.delete(`/courts/owner/${courtId}`);
  },

  toggleBlockSlot: async (blockData) => {
    return await api.post('/courts/owner/block-slot', blockData);
  },
};

export default courtService;
