const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Facility = require('../models/Facility');
const Court = require('../models/Court');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Report = require('../models/Report');
const OTP = require('../models/OTP');
const BOOKING_STATUS = require('../constants/bookingStatus');
const { seedUsers, seedFacilities } = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('🚀 Starting QuickCourt Database Seeding...');
    await connectDB();

    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Facility.deleteMany({}),
      Court.deleteMany({}),
      TimeSlot.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      OTP.deleteMany({}),
    ]);

    // 1. Insert Users
    console.log('👥 Seeding users...');
    const createdUsers = await User.create(seedUsers);
    const userMap = {};
    createdUsers.forEach((u) => {
      userMap[u.email] = u;
    });

    const rajeshOwner = userMap['owner@quickcourt.com'];
    const vikramOwner = userMap['vikram.owner@quickcourt.com'];
    const aaravUser = userMap['user@quickcourt.com'];
    const priyaUser = userMap['priya@quickcourt.com'];

    // 2. Insert Facilities
    console.log('🏟️ Seeding facilities...');
    const facilityDocs = [];

    for (const f of seedFacilities) {
      const ownerId = f.key === 'velocity' ? vikramOwner._id : rajeshOwner._id;
      const facilityDoc = await Facility.create({
        owner: ownerId,
        name: f.name,
        location: f.location,
        address: f.address,
        description: f.description,
        aboutVenue: f.aboutVenue,
        sportsSupported: f.sportsSupported,
        amenities: f.amenities,
        photos: f.photos,
        venueType: f.venueType,
        startingPrice: f.startingPrice,
        rating: f.rating,
        reviewCount: f.reviewCount,
        status: f.status,
        operatingHours: f.operatingHours,
      });
      facilityDocs.push({ key: f.key, doc: facilityDoc });
    }

    const facilityKeyMap = {};
    facilityDocs.forEach((item) => {
      facilityKeyMap[item.key] = item.doc;
    });

    // 3. Seed Courts
    console.log('🏸 Seeding courts...');
    const courtsToCreate = [
      // Apex Smash Arena
      {
        facility: facilityKeyMap['apex']._id,
        courtName: 'Court 1 - Pro Yonex Mat',
        sportType: 'Badminton',
        pricingPerHour: 450,
        surfaceType: 'BWF Certified Synthetic Cushion',
        operatingHours: { open: '06:00', close: '23:00' },
      },
      {
        facility: facilityKeyMap['apex']._id,
        courtName: 'Court 2 - Teak Wood Classic',
        sportType: 'Badminton',
        pricingPerHour: 500,
        surfaceType: 'Premium Teak Wood Sprung',
        operatingHours: { open: '06:00', close: '23:00' },
      },
      {
        facility: facilityKeyMap['apex']._id,
        courtName: 'TT Arena 1 - Stag Americas',
        sportType: 'Table Tennis',
        pricingPerHour: 300,
        surfaceType: 'Indoor Wood / Rubber Floor',
        operatingHours: { open: '07:00', close: '22:00' },
      },
      // Velocity Turf
      {
        facility: facilityKeyMap['velocity']._id,
        courtName: 'Turf Pitch Alpha (5-a-side)',
        sportType: 'Turf Football',
        pricingPerHour: 1200,
        surfaceType: 'FIFA Approved 50mm Infill Turf',
        operatingHours: { open: '06:00', close: '24:00' },
      },
      {
        facility: facilityKeyMap['velocity']._id,
        courtName: 'Cricket Pitch Beta (Box Cricket)',
        sportType: 'Box Cricket',
        pricingPerHour: 1400,
        surfaceType: 'High-Bounce Heavy Turf Net',
        operatingHours: { open: '06:00', close: '24:00' },
      },
      // Grand Slam Tennis
      {
        facility: facilityKeyMap['grandslam']._id,
        courtName: 'Centre Court - Acrylic Pro',
        sportType: 'Tennis',
        pricingPerHour: 700,
        surfaceType: 'US Open Style Cushion Acrylic',
        operatingHours: { open: '06:00', close: '22:00' },
      },
      {
        facility: facilityKeyMap['grandslam']._id,
        courtName: 'Court 2 - Red Clay Classic',
        sportType: 'Tennis',
        pricingPerHour: 800,
        surfaceType: 'Roland Garros Red Clay',
        operatingHours: { open: '06:00', close: '22:00' },
      },
      // Urban Smash
      {
        facility: facilityKeyMap['urbansmash']._id,
        courtName: 'Table 1 - Olympic Edition',
        sportType: 'Table Tennis',
        pricingPerHour: 350,
        surfaceType: 'Stag Tournament Mat',
        operatingHours: { open: '06:00', close: '23:00' },
      },
      {
        facility: facilityKeyMap['urbansmash']._id,
        courtName: 'Badminton Court 1',
        sportType: 'Badminton',
        pricingPerHour: 400,
        surfaceType: 'Synthetic Green Mat',
        operatingHours: { open: '06:00', close: '23:00' },
      },
    ];

    const createdCourts = await Court.create(courtsToCreate);

    // 4. Seed Time Slots & Sample Bookings
    console.log('📅 Seeding bookings & time slots...');
    const today = new Date().toISOString().split('T')[0];

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().split('T')[0];

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterday = yesterdayObj.toISOString().split('T')[0];

    const apexCourt1 = createdCourts.find((c) => c.courtName === 'Court 1 - Pro Yonex Mat');
    const turfAlpha = createdCourts.find((c) => c.courtName.includes('Turf Pitch Alpha'));
    const tennisCentre = createdCourts.find((c) => c.courtName.includes('Centre Court'));

    // Sample Bookings for Aarav (User)
    const bookingsData = [
      // Upcoming booking tomorrow for Aarav
      {
        user: aaravUser._id,
        facility: facilityKeyMap['apex']._id,
        court: apexCourt1._id,
        date: tomorrow,
        timeSlot: { startTime: '18:00', endTime: '19:00' },
        price: apexCourt1.pricingPerHour,
        convenienceFee: 0,
        total: apexCourt1.pricingPerHour,
        status: BOOKING_STATUS.CONFIRMED,
        paymentSimulation: {
          method: 'Simulated UPI (Google Pay / PhonePe)',
          status: 'PAID',
          transactionId: 'TXN_SIM_2026_01',
          paidAt: new Date(),
        },
      },
      // Completed booking yesterday
      {
        user: aaravUser._id,
        facility: facilityKeyMap['velocity']._id,
        court: turfAlpha._id,
        date: yesterday,
        timeSlot: { startTime: '20:00', endTime: '21:00' },
        price: turfAlpha.pricingPerHour,
        convenienceFee: 0,
        total: turfAlpha.pricingPerHour,
        status: BOOKING_STATUS.COMPLETED,
        paymentSimulation: {
          method: 'Simulated Credit Card',
          status: 'PAID',
          transactionId: 'TXN_SIM_2026_02',
          paidAt: yesterdayObj,
        },
      },
      // Booking for Priya
      {
        user: priyaUser._id,
        facility: facilityKeyMap['grandslam']._id,
        court: tennisCentre._id,
        date: tomorrow,
        timeSlot: { startTime: '08:00', endTime: '09:00' },
        price: tennisCentre.pricingPerHour,
        convenienceFee: 0,
        total: tennisCentre.pricingPerHour,
        status: BOOKING_STATUS.CONFIRMED,
        paymentSimulation: {
          method: 'Simulated Net Banking',
          status: 'PAID',
          transactionId: 'TXN_SIM_2026_03',
          paidAt: new Date(),
        },
      },
    ];

    const createdBookings = await Booking.create(bookingsData);

    // Link booking slots
    for (const b of createdBookings) {
      await TimeSlot.create({
        court: b.court,
        facility: b.facility,
        date: b.date,
        startTime: b.timeSlot.startTime,
        endTime: b.timeSlot.endTime,
        isBooked: true,
        booking: b._id,
      });
    }

    // Add a maintenance blocked slot by Rajesh Sharma on Court 2 tomorrow
    const apexCourt2 = createdCourts.find((c) => c.courtName.includes('Teak Wood'));
    if (apexCourt2) {
      await TimeSlot.create({
        court: apexCourt2._id,
        facility: facilityKeyMap['apex']._id,
        date: tomorrow,
        startTime: '14:00',
        endTime: '15:00',
        isBlocked: true,
        blockReason: 'Routine Wood Polish & Net Maintenance',
        isBooked: false,
      });
    }

    // 5. Seed Reviews
    console.log('⭐ Seeding customer reviews...');
    await Review.create([
      {
        user: aaravUser._id,
        facility: facilityKeyMap['apex']._id,
        rating: 5,
        comment: 'Outstanding synthetic court quality and anti-glare lighting! Locker rooms are pristine.',
      },
      {
        user: priyaUser._id,
        facility: facilityKeyMap['apex']._id,
        rating: 5,
        comment: 'Great air conditioning, friendly staff, and very easy court booking through QuickCourt.',
      },
      {
        user: aaravUser._id,
        facility: facilityKeyMap['velocity']._id,
        rating: 5,
        comment: 'Top quality turf turf with excellent bounce for 5v5 football. Night floodlights are super bright.',
      },
      {
        user: priyaUser._id,
        facility: facilityKeyMap['grandslam']._id,
        rating: 4,
        comment: 'Well maintained acrylic courts and very accessible location in HSR Layout.',
      },
    ]);

    // 6. Seed Sample Report for moderation testing
    await Report.create({
      reportedBy: aaravUser._id,
      targetType: 'FACILITY',
      targetId: facilityKeyMap['novaturf']._id,
      reason: 'Incomplete facility lighting information',
      details: 'Facility details did not list if floodlights are operational post 8 PM.',
      status: 'PENDING',
    });

    console.log('✅ Seeding completed successfully!');
    console.log('---------------------------------------------------------');
    console.log('DEMO ACCOUNTS READY TO USE:');
    console.log('1. User (Player):        user@quickcourt.com       / Password123!');
    console.log('2. Facility Owner:       owner@quickcourt.com      / Password123!');
    console.log('3. Admin:                admin@quickcourt.com      / Password123!');
    console.log('---------------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
