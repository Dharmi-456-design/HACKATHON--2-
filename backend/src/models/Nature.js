const mongoose = require('mongoose');

// Profile Schema
const weeklyGoalSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    text: { type: String, required: true, trim: true, maxlength: 300 },
    done: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    display_name: { type: String, default: 'Explorer' },
    city: { type: String, default: 'Portland' },
    region: { type: String, default: 'Oregon' },
    available_minutes: { type: Number, default: 20 },
    interests: [{ type: String }],
    onboarding_complete: { type: Boolean, default: true },
    saved_places: [{ type: String }],
    weekly_goals: { type: [weeklyGoalSchema], default: [] },
  },
  { timestamps: true }
);

// Discovery Schema
const discoverySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    common_name: { type: String, required: true, trim: true, maxlength: 200 },
    scientific_name: { type: String, default: '', trim: true, maxlength: 200 },
    confidence: { type: String, enum: ['high', 'medium', 'low', 'uncertain'], default: 'high' },
    confidence_pct: { type: Number, default: 90, min: 0, max: 100 },
    category: {
      type: String,
      enum: ['birds', 'trees', 'flowers', 'insects', 'fungi', 'moss', 'mammals', 'reptiles', 'other'],
      default: 'other',
    },
    description: { type: String, default: '', maxlength: 5000 },
    why_it_matters: { type: String, default: '', maxlength: 5000 },
    experience_suggestion: { type: String, default: '', maxlength: 5000 },
    place_name: { type: String, default: '', maxlength: 200 },
    city: { type: String, default: '', maxlength: 200 },
    image_url: { type: String, default: '' },
    is_public: { type: Boolean, default: true },
    notes: { type: String, default: '', maxlength: 5000 },
    raw_analysis: { type: Object },
  },
  { timestamps: true }
);
discoverySchema.index({ is_public: 1, createdAt: -1 });
discoverySchema.index({ user: 1, createdAt: -1 });

// Journal Entry Schema
const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    body: { type: String, required: true, maxlength: 30000 },
    mood: { type: String, default: 'quiet', maxlength: 100 },
    weather: { type: String, default: '', maxlength: 150 },
    place_name: { type: String, default: '', maxlength: 200 },
    image_url: { type: String, default: '' },
  },
  { timestamps: true }
);
journalSchema.index({ user: 1, createdAt: -1 });

// Mission Schema
const missionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: '', maxlength: 5000 },
    mission_type: { type: String, enum: ['observe', 'explore', 'learn', 'act', 'return'], default: 'observe' },
    duration_minutes: { type: Number, default: 15, min: 1, max: 1440 },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
    location_hint: { type: String, default: '', maxlength: 300 },
    why_it_matters: { type: String, default: '', maxlength: 5000 },
    scheduled_date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    completed_at: { type: Date },
  },
  { timestamps: true }
);
missionSchema.index({ user: 1, status: 1, createdAt: -1 });

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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, default: 'conservation', maxlength: 100 },
    status: { type: String, enum: ['todo', 'in_progress', 'done', 'recommended', 'pending', 'completed', 'scheduled'], default: 'todo' },
    points: { type: Number, default: 10 },
    minutes: { type: Number, default: 15 },
    description: { type: String, default: '', maxlength: 5000 },
    image_url: { type: String, default: '' },
    impact_note: { type: String, default: '', maxlength: 5000 },
  },
  { timestamps: true }
);
actionSchema.index({ user: 1, createdAt: -1 });

// Pulse Chat Thread Schema
const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, default: '', maxlength: 20000 },
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatThreadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, default: 'Ecological Inquiry', maxlength: 120 },
    messages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);
chatThreadSchema.index({ user: 1, updatedAt: -1 });

module.exports = {
  Profile: mongoose.model('Profile', profileSchema),
  Discovery: mongoose.model('Discovery', discoverySchema),
  JournalEntry: mongoose.model('JournalEntry', journalSchema),
  Mission: mongoose.model('Mission', missionSchema),
  Place: mongoose.model('Place', placeSchema),
  Story: mongoose.model('Story', storySchema),
  CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
  Action: mongoose.model('Action', actionSchema),
  ChatThread: mongoose.model('ChatThread', chatThreadSchema),
};
