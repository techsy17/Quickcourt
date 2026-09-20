const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const facilityRoutes = require('./facilityRoutes');
const courtRoutes = require('./courtRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/facilities', facilityRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'QuickCourt API is healthy and operational' });
});

module.exports = router;
