const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Authentication will not work.');
}

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

  if (!JWT_SECRET) {
    res.status(500);
    throw new Error('Server misconfiguration: JWT_SECRET is missing');
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

module.exports = { protect };
