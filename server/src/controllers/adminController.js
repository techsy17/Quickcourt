const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/responseHandler');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getPendingFacilities(req, res, next) {
    try {
      const facilities = await adminService.getAllFacilitiesAdmin({ status: 'PENDING' });
      return sendSuccess(res, facilities, 'Pending facilities retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getAllFacilities(req, res, next) {
    try {
      const { status } = req.query;
      const facilities = await adminService.getAllFacilitiesAdmin({ status });
      return sendSuccess(res, facilities, 'Facilities retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  // Unified status handler — works for both /status and /approval routes
  async updateFacilityStatus(req, res, next) {
    try {
      const { status, reason, comments } = req.body;
      const facility = await adminService.updateFacilityApproval(req.params.id, {
        status,
        comments: reason || comments || '',
      });
      return sendSuccess(res, facility, `Facility marked as ${status}.`);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { search, role, status } = req.query;
      const users = await adminService.getAllUsers({ search, role, status });
      return sendSuccess(res, users, 'Users retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  // New status-based handler
  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await adminService.updateUserStatus(req.params.id, status);
      return sendSuccess(res, user, `User ${status === 'BANNED' ? 'banned' : 'activated'}.`);
    } catch (err) {
      next(err);
    }
  }

  // Legacy ban handler
  async toggleUserBan(req, res, next) {
    try {
      const { isBanned } = req.body;
      const status = isBanned ? 'BANNED' : 'ACTIVE';
      const user = await adminService.updateUserStatus(req.params.id, status);
      return sendSuccess(res, user, isBanned ? 'User banned.' : 'User unbanned.');
    } catch (err) {
      next(err);
    }
  }

  async getUserBookingHistory(req, res, next) {
    try {
      const bookings = await adminService.getUserBookingHistory(req.params.id);
      return sendSuccess(res, bookings, 'User booking history retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getReports(req, res, next) {
    try {
      const { status } = req.query;
      const reports = await adminService.getReports({ status });
      return sendSuccess(res, reports, 'Reports retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async updateReportStatus(req, res, next) {
    try {
      const { status, resolution, adminNotes } = req.body;
      const report = await adminService.updateReportStatus(req.params.id, {
        status,
        resolution: resolution || adminNotes || '',
      });
      return sendSuccess(res, report, 'Report status updated.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
