const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ROLES = require('../constants/roles');

// ── User routes
router.post('/', protect, bookingController.create);
router.get('/my', protect, bookingController.getUserBookings);

// ── Facility Owner routes — specific named routes MUST come before param routes
router.get('/owner/list', protect, authorize(ROLES.FACILITY_OWNER, ROLES.ADMIN), bookingController.getOwnerBookings);
router.get('/owner/dashboard', protect, authorize(ROLES.FACILITY_OWNER, ROLES.ADMIN), bookingController.getOwnerDashboard);
router.get('/owner', protect, authorize(ROLES.FACILITY_OWNER, ROLES.ADMIN), bookingController.getOwnerBookings);
router.put('/owner/:id/status', protect, authorize(ROLES.FACILITY_OWNER, ROLES.ADMIN), bookingController.updateBookingStatus);

// ── Param routes (must come last)
router.put('/:id/cancel', protect, bookingController.cancel);

module.exports = router;
