const express = require('express');
const rateLimit = require('express-rate-limit');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload, validateImageBuffer } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many uploads, please try again later.' },
});

router.post(
  '/',
  uploadLimiter,
  protect,
  upload.single('image'),
  validateImageBuffer,
  asyncHandler(uploadImage)
);

module.exports = router;
