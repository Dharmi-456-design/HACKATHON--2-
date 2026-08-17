const express = require('express');
const rateLimit = require('express-rate-limit');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload, validateImageBuffer } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many uploads, please try again later.' },
});

const handleUploadMiddleware = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('image')(req, res, (err) => {
      if (err) return next(err);
      validateImageBuffer(req, res, next);
    });
  }
  next();
};

router.post('/', uploadLimiter, protect, handleUploadMiddleware, asyncHandler(uploadImage));
router.post('/base64', uploadLimiter, protect, asyncHandler(uploadImage));

module.exports = router;
