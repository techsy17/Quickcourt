const mongoose = require('mongoose');
const FACILITY_STATUS = require('../constants/facilityStatus');

const facilitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Short location is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Facility description is required'],
      trim: true,
    },
    aboutVenue: {
      type: String,
      default: '',
      trim: true,
    },
    sportsSupported: {
      type: [String],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one sport must be specified'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    venueType: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Hybrid'],
      default: 'Indoor',
    },
    startingPrice: {
      type: Number,
      default: 500,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(FACILITY_STATUS),
      default: FACILITY_STATUS.PENDING,
    },
    approvalComments: {
      type: String,
      default: '',
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
