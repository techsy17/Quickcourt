const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin, validateOTP } = require('../validators/authValidator');

router.post('/signup', validateSignup, authController.signup);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', validateLogin, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);

module.exports = router;
