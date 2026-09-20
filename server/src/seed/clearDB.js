const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Facility = require('../models/Facility');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Review = require('../models/Review');
const Report = require('../models/Report');
const OTP = require('../models/OTP');

const clearDatabase = async () => {
  try {
    console.log('[QuickCourt DB] Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log(`[QuickCourt DB] Connected to: ${config.MONGODB_URI}`);

    console.log('🧹 Clearing all collections for fresh real user entries...');
    await Promise.all([
      User.deleteMany({}),
      Facility.deleteMany({}),
      Court.deleteMany({}),
      Booking.deleteMany({}),
      TimeSlot.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      OTP.deleteMany({}),
    ]);

    console.log('✅ All collections successfully cleared! Database is clean and ready.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
