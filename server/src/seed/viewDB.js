const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');

const viewDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('\n================ QUICKCOURT DATABASE ================');
    
    const users = await User.find({}, 'name email role isVerified createdAt');
    console.log(`\n👥 USERS (${users.length}):`);
    if (users.length === 0) {
      console.log('   (No users found yet. Register on http://localhost:5173/signup)');
    } else {
      console.table(users.map(u => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Verified: u.isVerified,
        Created: u.createdAt ? new Date(u.createdAt).toLocaleTimeString() : 'N/A'
      })));
    }

    const facilities = await Facility.find({}, 'name location status startingPrice');
    console.log(`\n🏟️ FACILITIES (${facilities.length}):`);
    if (facilities.length === 0) {
      console.log('   (No facilities created yet)');
    } else {
      console.table(facilities.map(f => ({
        ID: f._id.toString().slice(-6),
        Name: f.name,
        Location: f.location,
        Status: f.status,
        Price: f.startingPrice
      })));
    }

    console.log('\n=====================================================\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error reading DB:', err);
    process.exit(1);
  }
};

viewDB();
