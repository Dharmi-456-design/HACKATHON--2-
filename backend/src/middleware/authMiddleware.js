const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'naturepulse_secure_jwt_secret_key_2026_prod';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error('Not authorized, token expired');
    }
    throw new Error('Not authorized, invalid token');
  }

  let user;
  try {
    user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, user lookup failed');
  }

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  req.user = user;
  next();
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token && JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch {}
  }

  // Fallback guest user for payment sessions
  req.user = {
    _id: 'guest-explorer-id',
    name: 'Explorer Guest',
    email: 'guest@naturepulse.app',
    role: 'citizen',
  };
  next();
});

module.exports = { protect, optionalProtect };
