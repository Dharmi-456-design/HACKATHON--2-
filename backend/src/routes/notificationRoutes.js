const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.get('/', getNotifications);
router.post('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
