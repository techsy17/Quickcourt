const mongoose = require('mongoose');
const BOOKING_STATUS = require('../constants/bookingStatus');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    price: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
    },
    paymentSimulation: {
      method: { type: String, default: 'Simulated Card / UPI' },
      status: { type: String, default: 'PAID' },
      transactionId: { type: String, default: () => 'TXN_' + Date.now().toString(36).toUpperCase() },
      paidAt: { type: Date, default: Date.now },
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
