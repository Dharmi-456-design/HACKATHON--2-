import React from 'react';
  
  const CommentRoutes = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default CommentRoutes;
  const express = require('express');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validateComment } = require('../validators/issueValidators');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router
  .route('/:id/comments')
  .get(asyncHandler(getComments))
  .post(protect, validateComment, asyncHandler(addComment));

module.exports = router;
