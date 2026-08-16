const express = require('express');
const {
  createIssue,
  getIssues,
  getMyIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  toggleUpvote,
} = require('../controllers/issueController');
const { changeStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  validateCreateIssue,
  validateUpdateIssue,
  validateStatus,
} = require('../validators/issueValidators');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.route('/mine').get(protect, asyncHandler(getMyIssues));

router
  .route('/')
  .get(asyncHandler(getIssues))
  .post(protect, validateCreateIssue, asyncHandler(createIssue));

router
  .route('/:id')
  .get(asyncHandler(getIssue))
  .patch(protect, validateUpdateIssue, asyncHandler(updateIssue))
  .delete(protect, asyncHandler(deleteIssue));

router.post('/:id/upvote', protect, asyncHandler(toggleUpvote));
router.patch(
  '/:id/status',
  protect,
  requireRole('admin'),
  validateStatus,
  asyncHandler(changeStatus)
);

module.exports = router;
