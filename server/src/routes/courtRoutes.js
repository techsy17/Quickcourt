const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ROLES = require('../constants/roles');

// Public routes
router.get('/facility/:facilityId', courtController.getByFacility);
router.get('/:id/time-slots', courtController.getTimeSlots);

// Facility Owner routes
router.post('/owner/create', protect, authorize(ROLES.FACILITY_OWNER), courtController.create);
router.put('/owner/:id', protect, authorize(ROLES.FACILITY_OWNER), courtController.update);
router.delete('/owner/:id', protect, authorize(ROLES.FACILITY_OWNER), courtController.delete);
router.post('/owner/block-slot', protect, authorize(ROLES.FACILITY_OWNER), courtController.toggleBlockSlot);

module.exports = router;
