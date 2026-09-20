const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility reference is required'],
    },
    courtName: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true,
    },
    sportType: {
      type: String,
      required: [true, 'Sport type is required'],
      trim: true,
    },
    pricingPerHour: {
      type: Number,
      required: [true, 'Pricing per hour is required'],
      min: 0,
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
    },
    surfaceType: {
      type: String,
      default: 'Standard',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);
