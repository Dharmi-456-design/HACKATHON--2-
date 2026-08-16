const express = require('express');
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
  getPlaces,
  getPlaceById,
  getStories,
  createStory,
  deleteStory,
  getCommunityPosts,
  createCommunityPost,
  getActions,
  getStreak,
  getBestTime,
  getWeeklyRecap,
  handlePulseChat,
  handleImageAnalyze,
} = require('../controllers/natureController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// AI Chatbot & Image Analysis
router.post('/pulse', asyncHandler(handlePulseChat));
router.post('/analyze', asyncHandler(handleImageAnalyze));

// Profile
router.route('/profile').get(asyncHandler(getProfile)).put(asyncHandler(updateProfile));

// Discoveries
router.route('/discoveries').get(asyncHandler(getDiscoveries)).post(asyncHandler(createDiscovery)).delete(asyncHandler(deleteDiscovery));

// Journal
router.route('/journal').get(asyncHandler(getJournal)).post(asyncHandler(createJournalEntry)).delete(asyncHandler(deleteJournalEntry));

// Missions
router.route('/missions').get(asyncHandler(getMissions)).post(asyncHandler(createMission));
router.route('/missions/:id').patch(asyncHandler(updateMission));

// Places
router.route('/places').get(asyncHandler(getPlaces));
router.route('/places/:id').get(asyncHandler(getPlaceById));

// Stories
router.route('/stories').get(asyncHandler(getStories)).post(asyncHandler(createStory)).delete(asyncHandler(deleteStory));

// Community
router.route('/community').get(asyncHandler(getCommunityPosts)).post(asyncHandler(createCommunityPost));

// Actions, Streaks & Insights
router.route('/actions').get(asyncHandler(getActions));
router.route('/streak').get(asyncHandler(getStreak));
router.route('/best-time').get(asyncHandler(getBestTime));
router.route('/weekly-recap').get(asyncHandler(getWeeklyRecap));

module.exports = router;
