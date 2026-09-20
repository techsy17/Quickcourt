const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      return sendSuccess(res, result, 'Registration successful. Please verify OTP.', 201);
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const result = await authService.verifyOTP(req.body);
      return sendSuccess(res, result, 'OTP verified successfully.', 200);
    } catch (err) {
      next(err);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email is required to resend OTP.', 400);
      }
      const result = await authService.resendOTP(email);
      return sendSuccess(res, result, 'New OTP generated successfully.', 200);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Logged in successfully.', 200);
    } catch (err) {
      if (err.requiresVerification) {
        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: err.email,
          message: err.message,
        });
      }
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      return sendSuccess(res, user, 'Profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);
      return sendSuccess(res, user, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
