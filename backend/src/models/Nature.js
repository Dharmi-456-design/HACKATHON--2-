const mongoose = require('mongoose');

// Profile Schema
const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    display_name: { type: String, default: 'Explorer' },
    city: { type: String, default: 'Portland' },
    region: { type: String, default: 'Oregon' },
    available_minutes: { type: Number, default: 20 },
    interests: [{ type: String }],
    onboarding_complete: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Discovery Schema
const discoverySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    common_name: { type: String, required: true },
    scientific_name: { type: String, default: '' },
    confidence: { type: String, enum: ['high', 'medium', 'low', 'uncertain'], default: 'high' },
    confidence_pct: { type: Number, default: 90 },
    category: {
      type: String,
      enum: ['birds', 'trees', 'flowers', 'insects', 'fungi', 'moss', 'mammals', 'reptiles', 'other'],
      default: 'other',
    },
    description: { type: String, default: '' },
    why_it_matters: { type: String, default: '' },
    experience_suggestion: { type: String, default: '' },
    place_name: { type: String, default: '' },
    city: { type: String, default: '' },
    image_url: { type: String, default: '' },
    is_public: { type: Boolean, default: true },
    notes: { type: String, default: '' },
    raw_analysis: { type: Object },
  },
  { timestamps: true }
);

// Journal Entry Schema
const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    mood: { type: String, default: 'quiet' },
    weather: { type: String, default: '' },
    place_name: { type: String, default: '' },
    image_url: { type: String, default: '' },
  },
  { timestamps: true }
);

// Mission Schema
const missionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    mission_type: { type: String, enum: ['observe', 'explore', 'learn', 'act', 'return'], default: 'observe' },
    duration_minutes: { type: Number, default: 15 },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
    location_hint: { type: String, default: '' },
    why_it_matters: { type: String, default: '' },
    scheduled_date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

// Place Schema
const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'park' },
    city: { type: String, default: 'Portland' },
    region: { type: String, default: 'Oregon' },
    difficulty: { type: String, default: 'easy' },
    walk_minutes: { type: Number, default: 15 },
    best_time: { type: String, default: 'Early morning' },
    description: { type: String, default: '' },
    why_it_matters: { type: String, default: '' },
    habitat: { type: String, default: '' },
    map_x: { type: Number, default: 50 },
    map_y: { type: Number, default: 50 },
    image_url: { type: String, default: '' },
    features: [{ type: String }],
  },
  { timestamps: true }
);

// Story Schema
const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    narrative: { type: String, required: true },
    species_highlights: [{ type: String }],
    image_url: { type: String, default: '' },
  },
  { timestamps: true }
);

// Community Post Schema
const communityPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    common_name: { type: String, required: true },
    scientific_name: { type: String, default: '' },
    category: { type: String, default: 'other' },
    note: { type: String, default: '' },
    image_url: { type: String, default: '' },
    confidence: { type: String, default: 'high' },
    city: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Action Schema
const actionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    category: { type: String, default: 'conservation' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    points: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = {
  Profile: mongoose.model('Profile', profileSchema),
  Discovery: mongoose.model('Discovery', discoverySchema),
  JournalEntry: mongoose.model('JournalEntry', journalSchema),
  Mission: mongoose.model('Mission', missionSchema),
  Place: mongoose.model('Place', placeSchema),
  Story: mongoose.model('Story', storySchema),
  CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
  Action: mongoose.model('Action', actionSchema),
};
