const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['FACILITY', 'USER'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
