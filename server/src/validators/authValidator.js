const ROLES = require('../constants/roles');
const { sendError } = require('../utils/responseHandler');

const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (role && ![ROLES.USER, ROLES.FACILITY_OWNER].includes(role)) {
    errors.push(`Role must be either ${ROLES.USER} or ${ROLES.FACILITY_OWNER}.`);
  }

  if (errors.length > 0) {
    return sendError(res, errors[0], 400, errors);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('A valid email is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return sendError(res, errors[0], 400, errors);
  }

  next();
};

const validateOTP = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('A valid email is required.');
  }

  if (!otp || String(otp).trim().length !== 6) {
    errors.push('A valid 6-digit OTP code is required.');
  }

  if (errors.length > 0) {
    return sendError(res, errors[0], 400, errors);
  }

  next();
};

module.exports = { validateSignup, validateLogin, validateOTP };
