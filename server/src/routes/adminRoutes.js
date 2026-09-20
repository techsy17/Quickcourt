const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ROLES = require('../constants/roles');

// All routes require ADMIN role
router.use(protect, authorize(ROLES.ADMIN));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Facilities
router.get('/facilities', adminController.getAllFacilities);           // ?status=PENDING|APPROVED|...
router.get('/facilities/pending', adminController.getPendingFacilities); // legacy compat
router.put('/facilities/:id/status', adminController.updateFacilityStatus);
router.put('/facilities/:id/approval', adminController.updateFacilityStatus); // legacy compat

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/ban', adminController.toggleUserBan);          // legacy compat
router.get('/users/:id/bookings', adminController.getUserBookingHistory);

// Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id/status', adminController.updateReportStatus);
router.put('/reports/:id', adminController.updateReportStatus);       // legacy compat

module.exports = router;
