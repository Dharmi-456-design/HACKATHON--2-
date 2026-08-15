import React from 'react';
  
  const UploadRoutes = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default UploadRoutes;
  const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', protect, upload.single('image'), asyncHandler(uploadImage));

module.exports = router;
