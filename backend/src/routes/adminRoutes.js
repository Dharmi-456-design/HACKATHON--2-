const express = require('express');
const { getStats, getLeaderboard, exportCsv } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/stats', protect, requireRole('admin'), asyncHandler(getStats));
router.get('/leaderboard', asyncHandler(getLeaderboard));
router.get('/export', protect, requireRole('admin'), asyncHandler(exportCsv));

module.exports = router;
