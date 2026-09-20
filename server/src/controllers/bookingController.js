const bookingService = require('../services/bookingService');
const { sendSuccess } = require('../utils/responseHandler');

class BookingController {
  async create(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.user._id, req.body);
      return sendSuccess(res, booking, 'Booking confirmed successfully!', 201);
    } catch (err) {
      next(err);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const { status, date } = req.query;
      const bookings = await bookingService.getUserBookings(req.user._id, { status, date });
      return sendSuccess(res, bookings, 'User bookings retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
      return sendSuccess(res, booking, 'Booking cancelled successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getOwnerBookings(req, res, next) {
    try {
      const { status, date } = req.query;
      const bookings = await bookingService.getOwnerBookings(req.user._id, { status, date });
      return sendSuccess(res, bookings, 'Facility bookings retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { status } = req.body;
      const booking = await bookingService.updateBookingStatus(req.params.id, req.user._id, status);
      return sendSuccess(res, booking, `Booking ${status.toLowerCase()} successfully.`);
    } catch (err) {
      next(err);
    }
  }

  async getOwnerDashboard(req, res, next) {
    try {
      const data = await bookingService.getOwnerDashboardData(req.user._id);
      return sendSuccess(res, data, 'Owner dashboard analytics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
