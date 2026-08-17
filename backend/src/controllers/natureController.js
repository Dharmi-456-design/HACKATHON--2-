// Re-export from split controllers for backward compatibility.
// This file is intentionally thin — all logic lives in the individual controller modules.
const { getProfile, updateProfile } = require('./profileController');
const { getDiscoveries, createDiscovery, deleteDiscovery } = require('./discoveryController');
const { getJournal, createJournalEntry, deleteJournalEntry } = require('./journalController');
const { getMissions, createMission, updateMission, deleteMission } = require('./missionController');
const { getPlaces, getPlaceById } = require('./placeController');
const { getStories, createStory, deleteStory, generateAIStory, assistAIStory } = require('./storyController');
const { getCommunityPosts, createCommunityPost, deleteCommunityPost, getTestimonials, getPublicStats } = require('./communityController');
const { getActions, createAction, updateAction, deleteAction, getStreak, getBestTime, getConnection } = require('./actionController');
const { getWeeklyRecap, getRecapSnapshots, createRecapSnapshot, deleteRecapSnapshot } = require('./recapController');
const { handlePulseChat, handleImageAnalyze, getPulseThreads, createPulseThread, renamePulseThread, deletePulseThread, clearPulseThreads, updatePulseThreadMessages } = require('./aiController');

module.exports = {
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
  getRecapSnapshots,
  createRecapSnapshot,
  deleteRecapSnapshot,
  getConnection,
  handlePulseChat,
  handleImageAnalyze,
  getPulseThreads,
  createPulseThread,
  renamePulseThread,
  deletePulseThread,
  clearPulseThreads,
  updatePulseThreadMessages,
};
