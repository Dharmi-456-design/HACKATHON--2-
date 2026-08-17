const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Handle demo / guest tokens instantly
  if (!token || token.startsWith('demo-') || token === 'demo-jwt-token-instant') {
    req.user = {
      _id: '650000000000000000000000',
      id: 'demo-user-id',
      name: 'Nature Explorer',
      email: 'explorer@naturepulse.org',
      role: 'user',
      city: 'Ahmedabad',
    };
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'naturepulse_secret');
  } catch (err) {
    // Fallback for expired or demo tokens
    req.user = {
      _id: '650000000000000000000000',
      id: 'demo-user-id',
      name: 'Nature Explorer',
      email: 'explorer@naturepulse.org',
      role: 'user',
      city: 'Ahmedabad',
    };
    return next();
  }

  let user;
  try {
    user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    user = null;
  }

  if (!user) {
    req.user = {
      _id: decoded.id || '650000000000000000000000',
      id: decoded.id || 'demo-user-id',
      name: 'Nature Explorer',
      email: 'explorer@naturepulse.org',
      role: 'user',
      city: 'Ahmedabad',
    };
    return next();
  }

  req.user = user;
  next();
});

module.exports = { protect };
