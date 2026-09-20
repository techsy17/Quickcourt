const facilityService = require('../services/facilityService');
const { sendSuccess } = require('../utils/responseHandler');

class FacilityController {
  async getApproved(req, res, next) {
    try {
      const { search, sport, maxPrice, venueType, minRating, page, limit } = req.query;
      const data = await facilityService.getApprovedFacilities({
        search,
        sport,
        maxPrice,
        venueType,
        minRating,
        page,
        limit,
      });
      return sendSuccess(res, data, 'Facilities retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await facilityService.getFacilityById(req.params.id);
      return sendSuccess(res, data, 'Facility details retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getOwnerFacilities(req, res, next) {
    try {
      const facilities = await facilityService.getOwnerFacilities(req.user._id);
      return sendSuccess(res, facilities, 'Owner facilities retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const facility = await facilityService.createFacility(req.user._id, req.body);
      return sendSuccess(
        res,
        facility,
        'Facility submitted successfully! It will be listed once approved by an administrator.',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const facility = await facilityService.updateFacility(req.params.id, req.user._id, req.body);
      return sendSuccess(res, facility, 'Facility updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async addReview(req, res, next) {
    try {
      const { rating, comment } = req.body;
      const result = await facilityService.addReview(req.params.id, req.user._id, {
        rating,
        comment,
      });
      return sendSuccess(res, result, 'Review submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FacilityController();
