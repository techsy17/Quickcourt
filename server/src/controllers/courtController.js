const courtService = require('../services/courtService');
const { sendSuccess } = require('../utils/responseHandler');

class CourtController {
  async getByFacility(req, res, next) {
    try {
      const courts = await courtService.getCourtsByFacility(req.params.facilityId);
      return sendSuccess(res, courts, 'Courts retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const court = await courtService.createCourt(req.user._id, req.body);
      return sendSuccess(res, court, 'Court created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const court = await courtService.updateCourt(req.user._id, req.params.id, req.body);
      return sendSuccess(res, court, 'Court updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await courtService.deleteCourt(req.user._id, req.params.id);
      return sendSuccess(res, result, 'Court removed successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getTimeSlots(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const slots = await courtService.getTimeSlots(id, targetDate);
      return sendSuccess(res, slots, 'Time slots retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async toggleBlockSlot(req, res, next) {
    try {
      const slot = await courtService.toggleBlockSlot(req.user._id, req.body);
      return sendSuccess(
        res,
        slot,
        slot.isBlocked ? 'Time slot blocked successfully.' : 'Time slot unblocked successfully.'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CourtController();
