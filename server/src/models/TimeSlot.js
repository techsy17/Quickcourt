const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      trim: true,
    },
    startTime: {
      type: String, // '07:00'
      required: true,
    },
    endTime: {
      type: String, // '08:00'
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: '',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate slot generation
timeSlotSchema.index({ court: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
