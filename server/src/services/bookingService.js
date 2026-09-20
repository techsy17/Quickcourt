const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Facility = require('../models/Facility');
const TimeSlot = require('../models/TimeSlot');
const BOOKING_STATUS = require('../constants/bookingStatus');

class BookingService {
  async createBooking(userId, { courtId, date, startTime, endTime, paymentMethod = 'Simulated UPI' }) {
    const court = await Court.findById(courtId).populate('facility');
    if (!court || !court.isActive) {
      throw new Error('Court is not active or available.');
    }

    // Check if slot is already booked or blocked
    const existingBooking = await Booking.findOne({
      court: courtId,
      date,
      'timeSlot.startTime': startTime,
      status: BOOKING_STATUS.CONFIRMED,
    });

    if (existingBooking) {
      throw new Error('This time slot has already been booked. Please choose another slot.');
    }

    const blockedSlot = await TimeSlot.findOne({
      court: courtId,
      date,
      startTime,
      isBlocked: true,
    });

    if (blockedSlot) {
      throw new Error(`This time slot is unavailable: ${blockedSlot.blockReason || 'Maintenance'}`);
    }

    const price = court.pricingPerHour;
    const convenienceFee = 0; // Simulated
    const total = price + convenienceFee;

    const booking = await Booking.create({
      user: userId,
      facility: court.facility._id,
      court: court._id,
      date,
      timeSlot: {
        startTime,
        endTime: endTime || `${String(parseInt(startTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`,
      },
      price,
      convenienceFee,
      total,
      status: BOOKING_STATUS.CONFIRMED,
      paymentSimulation: {
        method: paymentMethod,
        status: 'PAID',
        transactionId: `TXN_${Date.now().toString(36).toUpperCase()}`,
        paidAt: new Date(),
      },
    });

    // Mark or upsert TimeSlot record
    await TimeSlot.findOneAndUpdate(
      { court: courtId, date, startTime },
      {
        court: courtId,
        facility: court.facility._id,
        date,
        startTime,
        endTime: booking.timeSlot.endTime,
        isBooked: true,
        booking: booking._id,
      },
      { upsert: true, new: true }
    );

    const populatedBooking = await Booking.findById(booking._id)
      .populate('facility', 'name location photos sportsSupported')
      .populate('court', 'courtName sportType pricingPerHour')
      .populate('user', 'name email');

    return populatedBooking;
  }

  async getUserBookings(userId, { status, date }) {
    const filter = { user: userId };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (date) {
      filter.date = date;
    }

    const bookings = await Booking.find(filter)
      .populate('facility', 'name location photos sportsSupported address')
      .populate('court', 'courtName sportType pricingPerHour')
      .sort({ date: -1, 'timeSlot.startTime': -1 });

    // Mark past bookings as COMPLETED if currently CONFIRMED
    const today = new Date().toISOString().split('T')[0];
    const nowHour = new Date().getHours();

    for (const b of bookings) {
      if (b.status === BOOKING_STATUS.CONFIRMED) {
        const slotEndHour = parseInt(b.timeSlot.endTime?.split(':')[0] || '24', 10);
        if (b.date < today || (b.date === today && nowHour >= slotEndHour)) {
          b.status = BOOKING_STATUS.COMPLETED;
          await Booking.updateOne({ _id: b._id }, { status: BOOKING_STATUS.COMPLETED });
        }
      }
    }

    return bookings;
  }

  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new Error('Booking is already cancelled.');
    }

    // Check if booking is in the future
    const today = new Date().toISOString().split('T')[0];
    const nowHour = new Date().getHours();
    const slotStartHour = parseInt(booking.timeSlot.startTime.split(':')[0], 10);

    if (booking.date < today || (booking.date === today && nowHour >= slotStartHour)) {
      throw new Error('Past or ongoing bookings cannot be cancelled.');
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Cancelled by user';
    await booking.save();

    // Free up the time slot
    await TimeSlot.findOneAndUpdate(
      { court: booking.court, date: booking.date, startTime: booking.timeSlot.startTime },
      { isBooked: false, booking: null }
    );

    return booking;
  }

  async getOwnerBookings(ownerId, { status, date } = {}) {
    const facilities = await Facility.find({ owner: ownerId }).select('_id');
    const facilityIds = facilities.map((f) => f._id);

    const filter = { facility: { $in: facilityIds } };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (date) filter.date = date;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('facility', 'name')
      .populate('court', 'courtName sportType pricingPerHour')
      .sort({ date: -1, createdAt: -1 });

    // Normalize for frontend (userId, courtId, etc.)
    return bookings.map((b) => {
      const obj = b.toObject();
      obj.userId = obj.user;
      obj.courtId = obj.court;
      obj.facilityId = obj.facility;
      obj.bookingDate = obj.date;
      obj.slots = [obj.timeSlot?.startTime, obj.timeSlot?.endTime].filter(Boolean);
      obj.totalHours = 1;
      obj.totalAmount = obj.total;
      return obj;
    });
  }

  async updateBookingStatus(bookingId, ownerId, status) {
    const booking = await Booking.findById(bookingId).populate('facility', 'owner');
    if (!booking) throw new Error('Booking not found.');
    if (String(booking.facility?.owner) !== String(ownerId)) {
      throw new Error('Unauthorized.');
    }
    const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!allowed.includes(status)) throw new Error('Invalid status.');
    booking.status = status;
    await booking.save();
    return booking;
  }

  async getOwnerDashboardData(ownerId) {
    const facilities = await Facility.find({ owner: ownerId });
    const facilityIds = facilities.map((f) => f._id);

    const courts = await Court.find({ facility: { $in: facilityIds } });
    const courtIds = courts.map((c) => c._id);
    const activeCourtsCount = courts.filter((c) => c.isActive).length;

    const allBookings = await Booking.find({ facility: { $in: facilityIds } })
      .populate('court', 'courtName sportType pricingPerHour')
      .populate('user', 'name');

    const totalBookings = allBookings.length;
    const confirmedBookings = allBookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);
    const simulatedEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total || 0), 0);

    // 1. Daily/Weekly Trends
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = allBookings.filter((b) => b.date === dateStr).length;
      const earnings = allBookings
        .filter((b) => b.date === dateStr && b.status !== BOOKING_STATUS.CANCELLED)
        .reduce((s, b) => s + (b.total || 0), 0);

      last7Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        bookings: count,
        earnings,
      });
    }

    // 2. Earnings Summary by Sport
    const earningsBySport = {};
    confirmedBookings.forEach((b) => {
      const sport = b.court?.sportType || 'Other';
      earningsBySport[sport] = (earningsBySport[sport] || 0) + (b.total || 0);
    });

    const earningsSummary = Object.keys(earningsBySport).map((sport) => ({
      sport,
      earnings: earningsBySport[sport],
    }));

    // 3. Peak Booking Hours Heatmap / Distribution (06:00 to 22:00)
    const hourCounts = {};
    for (let h = 6; h <= 22; h++) {
      const hStr = `${String(h).padStart(2, '0')}:00`;
      hourCounts[hStr] = 0;
    }
    allBookings.forEach((b) => {
      const h = b.timeSlot?.startTime;
      if (h && hourCounts[h] !== undefined) {
        hourCounts[h]++;
      }
    });

    const peakHours = Object.keys(hourCounts).map((hour) => ({
      hour,
      count: hourCounts[hour],
    }));

    // 4. Booking Calendar / Recent Bookings
    const upcomingBookings = allBookings
      .filter((b) => b.status === BOOKING_STATUS.CONFIRMED)
      .slice(0, 10);

    return {
      kpis: {
        totalBookings,
        activeCourts: activeCourtsCount,
        simulatedEarnings,
      },
      charts: {
        dailyTrends: last7Days,
        earningsSummary,
        peakHours,
      },
      upcomingBookings,
      facilitiesCount: facilities.length,
    };
  }
}

module.exports = new BookingService();
