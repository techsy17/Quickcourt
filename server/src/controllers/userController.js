const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHandler');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      return sendSuccess(res, user, 'Profile fetched successfully.');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);
      return sendSuccess(res, user, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
