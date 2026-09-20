const Court = require('../models/Court');
const Facility = require('../models/Facility');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const BOOKING_STATUS = require('../constants/bookingStatus');

class CourtService {
  async getCourtsByFacility(facilityId) {
    const courts = await Court.find({ facility: facilityId, isActive: true }).sort({ courtName: 1 });
    return courts;
  }

  async createCourt(ownerId, { facilityId, courtName, sportType, pricingPerHour, operatingHours, surfaceType }) {
    const facility = await Facility.findOne({ _id: facilityId, owner: ownerId });
    if (!facility) {
      throw new Error('Facility not found or you are not authorized to add courts to it.');
    }

    const court = await Court.create({
      facility: facilityId,
      courtName,
      sportType,
      pricingPerHour: Number(pricingPerHour),
      operatingHours: operatingHours || facility.operatingHours,
      surfaceType: surfaceType || 'Standard',
      isActive: true,
    });

    // Update facility starting price if this court has lower price
    if (!facility.startingPrice || court.pricingPerHour < facility.startingPrice) {
      facility.startingPrice = court.pricingPerHour;
      await facility.save();
    }

    return court;
  }

  async updateCourt(ownerId, courtId, data) {
    const court = await Court.findById(courtId).populate('facility');
    if (!court || String(court.facility.owner) !== String(ownerId)) {
      throw new Error('Court not found or unauthorized.');
    }

    const allowed = ['courtName', 'sportType', 'pricingPerHour', 'operatingHours', 'surfaceType', 'isActive'];
    allowed.forEach((field) => {
      if (data[field] !== undefined) {
        court[field] = data[field];
      }
    });

    await court.save();
    return court;
  }

  async deleteCourt(ownerId, courtId) {
    const court = await Court.findById(courtId).populate('facility');
    if (!court || String(court.facility.owner) !== String(ownerId)) {
      throw new Error('Court not found or unauthorized.');
    }

    // Soft delete court
    court.isActive = false;
    await court.save();
    return { message: 'Court removed successfully.' };
  }

  async getTimeSlots(courtId, date) {
    const court = await Court.findById(courtId);
    if (!court) {
      throw new Error('Court not found.');
    }

    // Generate standard 1-hour slots based on operating hours
    const openHour = parseInt(court.operatingHours?.open?.split(':')[0] || '6', 10);
    const closeHour = parseInt(court.operatingHours?.close?.split(':')[0] || '23', 10);

    // Fetch existing overrides/blocks for this date
    const storedSlots = await TimeSlot.find({ court: courtId, date });
    const slotMap = new Map();
    storedSlots.forEach((s) => {
      slotMap.set(s.startTime, s);
    });

    // Fetch active bookings for this date and court
    const activeBookings = await Booking.find({
      court: courtId,
      date,
      status: BOOKING_STATUS.CONFIRMED,
    });
    const bookingMap = new Map();
    activeBookings.forEach((b) => {
      bookingMap.set(b.timeSlot.startTime, b);
    });

    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      const start = `${String(h).padStart(2, '0')}:00`;
      const end = `${String(h + 1).padStart(2, '0')}:00`;

      const override = slotMap.get(start);
      const booking = bookingMap.get(start);

      const isBlocked = override ? override.isBlocked : false;
      const blockReason = override ? override.blockReason : '';
      const isBooked = !!booking || (override ? override.isBooked : false);

      slots.push({
        courtId,
        date,
        startTime: start,
        endTime: end,
        isBlocked,
        blockReason,
        isBooked,
        isAvailable: !isBlocked && !isBooked,
        bookingId: booking ? booking._id : null,
      });
    }

    return slots;
  }

  async toggleBlockSlot(ownerId, { courtId, date, startTime, endTime, isBlocked, blockReason }) {
    const court = await Court.findById(courtId).populate('facility');
    if (!court || String(court.facility.owner) !== String(ownerId)) {
      throw new Error('Court not found or unauthorized.');
    }

    let slot = await TimeSlot.findOne({ court: courtId, date, startTime });
    if (!slot) {
      slot = new TimeSlot({
        court: courtId,
        facility: court.facility._id,
        date,
        startTime,
        endTime: endTime || `${String(parseInt(startTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`,
      });
    }

    slot.isBlocked = Boolean(isBlocked);
    slot.blockReason = blockReason || (isBlocked ? 'Maintenance / Reserved' : '');
    await slot.save();

    return slot;
  }
}

module.exports = new CourtService();
