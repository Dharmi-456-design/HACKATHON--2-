const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Precomputed hash used only to equalize response timing when an email is unknown,
// preventing timing-based account enumeration (see authController login).
const DUMMY_HASH = bcrypt.hashSync('dummy-timing-equalizer', 12);

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

const register = asyncHandler(async (req, res, next) => {
  checkValidation(req);
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Registration failed. Please check your details and try again.');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
    },
    token,
  });
});

const login = asyncHandler(async (req, res, next) => {
  checkValidation(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && user.isLocked()) {
    res.status(429);
    throw new Error('Too many attempts. Please try again later.');
  }

  // Always run a bcrypt comparison (dummy hash when user not found) so response
  // time does not reveal whether the email exists.
  const valid = user ? await user.matchPassword(password) : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !valid) {
    if (user) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_MS);
        user.failedAttempts = 0;
      }
      await user.save();
    }
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.failedAttempts || user.lockUntil) {
    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  const token = generateToken(user);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
    },
    token,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
});

module.exports = { register, login, getMe };
