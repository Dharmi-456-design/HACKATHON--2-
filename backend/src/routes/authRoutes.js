const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', loginLimiter, validateLogin, asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
