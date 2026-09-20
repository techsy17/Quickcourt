const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
