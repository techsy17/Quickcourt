const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ROLES = require('../constants/roles');

// ── Named owner routes FIRST (before param routes)
router.get('/owner/my-facilities', protect, authorize(ROLES.FACILITY_OWNER, ROLES.ADMIN), facilityController.getOwnerFacilities);
router.post('/owner/create', protect, authorize(ROLES.FACILITY_OWNER), facilityController.create);
router.put('/owner/:id', protect, authorize(ROLES.FACILITY_OWNER), facilityController.update);

// ── Public routes
router.get('/', facilityController.getApproved);

// ── Param routes (must come after named routes)
router.get('/:id', facilityController.getById);
router.post('/:id/reviews', protect, facilityController.addReview);

module.exports = router;
