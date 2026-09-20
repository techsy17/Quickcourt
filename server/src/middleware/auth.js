const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User associated with this token not found.', 401);
    }

    if (user.isBanned) {
      return sendError(res, 'Your account has been suspended by an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = { protect, optionalProtect };
