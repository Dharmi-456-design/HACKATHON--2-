const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getProfile,
  updateProfile,
  getDiscoveries,
  createDiscovery,
  deleteDiscovery,
  getJournal,
  createJournalEntry,
  deleteJournalEntry,
  getMissions,
  createMission,
  updateMission,
  deleteMission,
  getPlaces,
  getPlaceById,
  getStories,
  createStory,
  deleteStory,
  generateAIStory,
  assistAIStory,
  getCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  getTestimonials,
  getPublicStats,
  getActions,
  createAction,
  updateAction,
  deleteAction,
  getStreak,
  getBestTime,
  getWeeklyRecap,
  getConnection,
  handlePulseChat,
  handleImageAnalyze,
  getPulseThreads,
  createPulseThread,
  renamePulseThread,
  deletePulseThread,
  clearPulseThreads,
  updatePulseThreadMessages,
} = require('../controllers/natureController');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please slow down and try again.' },
});

// AI Chatbot & Image Analysis (public but rate-limited; keys stay server-side)
router.post('/pulse', aiLimiter, asyncHandler(handlePulseChat));
router.post('/analyze', aiLimiter, asyncHandler(handleImageAnalyze));
router.post('/stories/generate', aiLimiter, asyncHandler(generateAIStory));
router.post('/stories/assist', aiLimiter, asyncHandler(assistAIStory));

// Pulse chat threads (private, user-owned)
router
  .route('/pulse/threads')
  .get(protect, asyncHandler(getPulseThreads))
  .post(protect, asyncHandler(createPulseThread))
  .delete(protect, asyncHandler(clearPulseThreads));
router
  .route('/pulse/threads/:id')
  .patch(protect, asyncHandler(renamePulseThread))
  .delete(protect, asyncHandler(deletePulseThread));
router.put('/pulse/threads/:id/messages', protect, asyncHandler(updatePulseThreadMessages));

// Profile (private)
router.route('/profile').get(protect, asyncHandler(getProfile)).put(protect, asyncHandler(updateProfile));

// Discoveries
router
  .route('/discoveries')
  .get(asyncHandler(getDiscoveries))
  .post(protect, asyncHandler(createDiscovery));
router.delete('/discoveries/:id', protect, asyncHandler(deleteDiscovery));

// Journal (private)
router
  .route('/journal')
  .get(protect, asyncHandler(getJournal))
  .post(protect, asyncHandler(createJournalEntry));
router.delete('/journal/:id', protect, asyncHandler(deleteJournalEntry));

// Missions (private)
router.route('/missions').get(protect, asyncHandler(getMissions)).post(protect, asyncHandler(createMission));
router.route('/missions/:id').patch(protect, asyncHandler(updateMission)).delete(protect, asyncHandler(deleteMission));

// Places (public)
router.route('/places').get(asyncHandler(getPlaces));
router.route('/places/:id').get(asyncHandler(getPlaceById));

// Stories
router
  .route('/stories')
  .get(asyncHandler(getStories))
  .post(protect, asyncHandler(createStory))
  .delete(protect, asyncHandler(deleteStory));

// Community
router
  .route('/community')
  .get(asyncHandler(getCommunityPosts))
  .post(protect, asyncHandler(createCommunityPost));
router.route('/community/:id').delete(protect, asyncHandler(deleteCommunityPost));

// Public marketing data (testimonials from real reports, live aggregate stats)
router.get('/testimonials', asyncHandler(getTestimonials));
router.get('/stats', asyncHandler(getPublicStats));

// Actions, Streaks & Insights (private)
router.route('/actions').get(protect, asyncHandler(getActions)).post(protect, asyncHandler(createAction));
router.route('/actions/:id').patch(protect, asyncHandler(updateAction)).delete(protect, asyncHandler(deleteAction));
router.route('/streak').get(protect, asyncHandler(getStreak));
router.route('/best-time').get(protect, asyncHandler(getBestTime));
router.route('/weekly-recap').get(protect, asyncHandler(getWeeklyRecap));
router.route('/connection').get(protect, asyncHandler(getConnection));

module.exports = router;
