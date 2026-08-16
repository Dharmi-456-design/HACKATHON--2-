const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
