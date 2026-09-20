const User = require('../models/User');
const Facility = require('../models/Facility');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const ROLES = require('../constants/roles');
const FACILITY_STATUS = require('../constants/facilityStatus');
const BOOKING_STATUS = require('../constants/bookingStatus');

class AdminService {
  async getDashboardStats() {
    const totalUsers = await User.countDocuments({ role: ROLES.USER });
    const totalOwners = await User.countDocuments({ role: ROLES.FACILITY_OWNER });
    const totalBookings = await Booking.countDocuments();
    const activeCourts = await Court.countDocuments({ isActive: true });
    const pendingFacilities = await Facility.countDocuments({ status: FACILITY_STATUS.PENDING });
    const totalFacilities = await Facility.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });

    // Today's bookings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const bookingsToday = await Booking.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // New users this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthStart },
    });

    // Total revenue from confirmed/completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Bookings by status
    const bookingsByStatusRaw = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const bookingsByStatus = {};
    bookingsByStatusRaw.forEach((b) => { bookingsByStatus[b._id] = b.count; });

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const res = await Booking.aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] }, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
      ]);
      revenueByMonth.push({
        month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: res[0]?.revenue || 0,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        value: res[0]?.revenue || 0,
      });
    }

    // Top 5 facilities by revenue
    const topFacilitiesRaw = await Booking.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: '$facilityId', revenue: { $sum: '$totalAmount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);
    const topFacilityIds = topFacilitiesRaw.map((f) => f._id);
    const topFacilityDocs = await Facility.find({ _id: { $in: topFacilityIds } }).select('name');
    const topFacilities = topFacilitiesRaw.map((f) => ({
      _id: f._id,
      name: topFacilityDocs.find((d) => String(d._id) === String(f._id))?.name || 'Unknown',
      revenue: f.revenue,
    }));

    return {
      totalUsers,
      totalOwners,
      totalFacilities,
      totalBookings,
      activeCourts,
      pendingFacilities,
      pendingReports,
      bookingsToday,
      newUsersThisMonth,
      totalRevenue,
      bookingsByStatus,
      revenueByMonth,
      topFacilities,
      conversionRate: totalBookings > 0 ? Math.round(((bookingsByStatus.CONFIRMED || 0) + (bookingsByStatus.COMPLETED || 0)) / totalBookings * 100) : 0,
    };
  }

  async getAllFacilitiesAdmin({ status } = {}) {
    const filter = {};
    if (status) filter.status = status;
    const facilities = await Facility.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    // Normalize: expose owner as ownerId for frontend compatibility
    return facilities.map((f) => {
      const obj = f.toObject();
      obj.ownerId = obj.owner;
      obj.sports = obj.sportsSupported;
      obj.contactPhone = obj.contactPhone || '';
      return obj;
    });
  }

  async updateFacilityApproval(facilityId, { status, comments = '' }) {
    const facility = await Facility.findById(facilityId);
    if (!facility) throw new Error('Facility not found.');
    const allowed = ['APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!allowed.includes(status)) throw new Error(`Status must be one of: ${allowed.join(', ')}`);
    facility.status = status;
    facility.approvalComments = comments;
    await facility.save();
    return facility;
  }

  async getAllUsers({ search, role, status } = {}) {
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (role && role !== 'all') filter.role = role;
    // Support both accountStatus field and legacy isBanned
    if (status === 'BANNED') filter.$or = [{ accountStatus: 'BANNED' }, { isBanned: true }];
    if (status === 'ACTIVE') filter.$or = [{ accountStatus: 'ACTIVE' }, { isBanned: { $ne: true } }];
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return users.map((u) => {
      const obj = u.toObject();
      // Normalize accountStatus for frontend
      if (!obj.accountStatus) obj.accountStatus = obj.isBanned ? 'BANNED' : 'ACTIVE';
      return obj;
    });
  }

  async updateUserStatus(userId, status) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');
    if (user.role === ROLES.ADMIN) throw new Error('Admin accounts cannot be modified.');
    user.isBanned = status === 'BANNED';
    await user.save();
    return user.toObject();
  }

  async getUserBookingHistory(userId) {
    const bookings = await Booking.find({ user: userId })
      .populate('facility', 'name')
      .populate('court', 'courtName sportType pricingPerHour')
      .sort({ createdAt: -1 });
    return bookings;
  }

  async updateBookingStatus(bookingId, ownerId, status) {
    const Facility = require('../models/Facility');
    const booking = await Booking.findById(bookingId).populate('facility', 'owner');
    if (!booking) throw new Error('Booking not found.');
    if (String(booking.facility?.owner) !== String(ownerId)) {
      throw new Error('Unauthorized: This booking does not belong to your facility.');
    }
    const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!allowed.includes(status)) throw new Error(`Invalid status. Must be one of: ${allowed.join(', ')}`);
    booking.status = status;
    await booking.save();
    return booking;
  }

  async getReports({ status } = {}) {
    const filter = {};
    if (status) filter.status = status;
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    return reports;
  }

  async updateReportStatus(reportId, { status, resolution = '' }) {
    const report = await Report.findById(reportId);
    if (!report) throw new Error('Report not found.');
    if (status) report.status = status;
    if (resolution) {
      report.resolution = resolution;
      report.adminNotes = resolution; // support both fields
    }
    await report.save();
    return report;
  }
}

module.exports = new AdminService();
