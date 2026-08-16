const {
  Profile,
  Discovery,
  JournalEntry,
  Mission,
  Place,
  Story,
  CommunityPost,
  Action,
} = require('../models/Nature');

// Seed starter data if collections are empty
const DEFAULT_PLACES = [
  {
    name: 'Forest Park Edge',
    type: 'forest',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 12,
    best_time: 'Early morning',
    description: 'Ancient Douglas fir and fern canopy at the urban boundary.',
    why_it_matters: 'One of the largest urban forest reserves in the United States.',
    habitat: 'Temperate coniferous forest',
    map_x: 35,
    map_y: 42,
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    features: ['Old growth trees', 'Native ferns', 'Stream crossings'],
  },
  {
    name: 'Willamette River Bank',
    type: 'river',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 8,
    best_time: 'Dawn or dusk',
    description: 'Riparian wetland margin frequented by great blue herons and ospreys.',
    why_it_matters: 'Critical urban migration corridor for anadromous salmon and waterbirds.',
    habitat: 'Riparian gravel bar & marsh',
    map_x: 62,
    map_y: 58,
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
    features: ['Heron perches', 'Gravel shoreline', 'Tidal mudflats'],
  },
  {
    name: 'Mount Tabor South Slope',
    type: 'volcanic park',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'moderate',
    walk_minutes: 20,
    best_time: 'Late afternoon',
    description: 'Extinct volcanic cinder cone populated with open oak meadows and songbirds.',
    why_it_matters: 'Oak savanna remnant providing essential acorns and nesting cavities.',
    habitat: 'Oregon white oak savanna',
    map_x: 78,
    map_y: 30,
    image_url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80',
    features: ['Oak meadow', 'Panoramic vistas', 'Woodpecker snags'],
  },
];

const DEFAULT_MISSIONS = [
  {
    title: 'Listen to tree canopy at dawn',
    description: 'Stand under the largest tree in your neighborhood for 5 minutes without looking at your phone.',
    mission_type: 'observe',
    duration_minutes: 10,
    status: 'scheduled',
    location_hint: 'Any nearby tree',
    why_it_matters: 'Slowing down helps tune your sensory system to ambient nature sounds.',
  },
  {
    title: 'Find 3 distinct moss textures',
    description: 'Touch 3 different patches of moss on trees, walls, or ground. Notice moisture and thickness differences.',
    mission_type: 'explore',
    duration_minutes: 15,
    status: 'scheduled',
    location_hint: 'Shaded wall or tree base',
    why_it_matters: 'Mosses act as micro-ecosystem sponges, filtering urban rainwater.',
  },
  {
    title: 'Identify a night moth visitor',
    description: 'Check a light source near outdoor plants after dusk.',
    mission_type: 'learn',
    duration_minutes: 20,
    status: 'scheduled',
    location_hint: 'Porch light or park lamp',
    why_it_matters: 'Moths are essential nocturnal pollinators often overlooked.',
  },
];

// Profile
const getProfile = async (req, res) => {
  let profile = await Profile.findOne(req.user ? { user: req.user._id } : {});
  if (!profile) {
    profile = await Profile.create({
      user: req.user?._id,
      display_name: req.user?.name || 'Explorer',
      city: 'Portland',
      region: 'Oregon',
      available_minutes: 20,
      interests: ['urban wild', 'trees & bark'],
      onboarding_complete: true,
    });
  }
  res.json(profile);
};

const updateProfile = async (req, res) => {
  let profile = await Profile.findOne(req.user ? { user: req.user._id } : {});
  if (!profile) {
    profile = new Profile({ user: req.user?._id, ...req.body });
  } else {
    Object.assign(profile, req.body);
  }
  await profile.save();
  res.json(profile);
};

// Discoveries
const getDiscoveries = async (req, res) => {
  const query = req.user ? { $or: [{ user: req.user._id }, { is_public: true }] } : {};
  const discoveries = await Discovery.find(query).sort({ createdAt: -1 });
  res.json(discoveries);
};

const createDiscovery = async (req, res) => {
  const discovery = await Discovery.create({
    user: req.user?._id,
    ...req.body,
  });
  res.status(201).json(discovery);
};

const deleteDiscovery = async (req, res) => {
  const { id } = req.body;
  await Discovery.findByIdAndDelete(id);
  res.json({ success: true });
};

// Journal
const getJournal = async (req, res) => {
  const query = req.user ? { user: req.user._id } : {};
  let entries = await JournalEntry.find(query).sort({ createdAt: -1 });
  if (!entries.length) {
    entries = [
      {
        _id: 'j1',
        title: 'Morning rain on cedar bark',
        body: 'The rain turned the dry cedar bark almost black. The smell of damp needles was unmistakable. Saw two chickadees flitting between lower branches.',
        mood: 'quiet',
        weather: 'Soft rain, 12°C',
        createdAt: new Date().toISOString(),
      },
    ];
  }
  res.json(entries);
};

const createJournalEntry = async (req, res) => {
  const entry = await JournalEntry.create({
    user: req.user?._id,
    ...req.body,
  });
  res.status(201).json(entry);
};

const deleteJournalEntry = async (req, res) => {
  const { id } = req.body;
  await JournalEntry.findByIdAndDelete(id);
  res.json({ success: true });
};

// Missions
const getMissions = async (req, res) => {
  let missions = await Mission.find(req.user ? { user: req.user._id } : {}).sort({ createdAt: -1 });
  if (!missions.length) {
    missions = DEFAULT_MISSIONS.map((m, idx) => ({
      ...m,
      _id: `m${idx + 1}`,
      scheduled_date: new Date().toISOString().slice(0, 10),
    }));
  }
  res.json(missions);
};

const createMission = async (req, res) => {
  const mission = await Mission.create({
    user: req.user?._id,
    ...req.body,
  });
  res.status(201).json(mission);
};

const updateMission = async (req, res) => {
  const { id } = req.params;
  const mission = await Mission.findByIdAndUpdate(id, req.body, { new: true });
  res.json(mission);
};

// Places
const getPlaces = async (req, res) => {
  let places = await Place.find({});
  if (!places.length) {
    places = await Place.insertMany(DEFAULT_PLACES);
  }
  res.json(places);
};

// Stories
const getStories = async (req, res) => {
  let stories = await Story.find({}).sort({ createdAt: -1 });
  if (!stories.length) {
    stories = [
      {
        _id: 's1',
        title: 'Thread of Urban Adaptation',
        narrative: 'Across your latest notes, native flora and urban wildlife show an interconnected rhythm.',
        createdAt: new Date().toISOString(),
      },
    ];
  }
  res.json(stories);
};

const createStory = async (req, res) => {
  const story = await Story.create({
    user: req.user?._id,
    ...req.body,
  });
  res.status(201).json(story);
};

const deleteStory = async (req, res) => {
  const { id } = req.body;
  await Story.findByIdAndDelete(id);
  res.json({ success: true });
};

// Community
const getCommunityPosts = async (req, res) => {
  let posts = await CommunityPost.find({}).sort({ createdAt: -1 });
  if (!posts.length) {
    const discoveries = await Discovery.find({ is_public: true }).sort({ createdAt: -1 }).limit(10);
    posts = discoveries.map((d) => ({
      _id: d._id,
      common_name: d.common_name,
      scientific_name: d.scientific_name,
      category: d.category,
      city: d.city || 'Portland',
      image_url: d.image_url,
      note: d.notes || d.description,
      confidence: d.confidence,
      createdAt: d.createdAt,
    }));
  }
  res.json(posts);
};

const createCommunityPost = async (req, res) => {
  const post = await CommunityPost.create({
    user: req.user?._id,
    ...req.body,
  });
  res.status(201).json(post);
};

// Actions
const getActions = async (req, res) => {
  let actions = await Action.find(req.user ? { user: req.user._id } : {});
  if (!actions.length) {
    actions = [
      { _id: 'a1', title: 'Plant native pollinator flowers', category: 'habitat', status: 'todo', points: 25 },
      { _id: 'a2', title: 'Pick up litter along local stream', category: 'cleanliness', status: 'done', points: 15 },
      { _id: 'a3', title: 'Install a window bird-strike decal', category: 'wildlife', status: 'todo', points: 20 },
    ];
  }
  res.json(actions);
};

// Streak & Stats
const getStreak = async (req, res) => {
  res.json({ streak: 4, last_active: new Date().toISOString() });
};

const getBestTime = async (req, res) => {
  res.json({ suggestion: 'Golden hour — best light for observation', condition: 'morning' });
};

const getWeeklyRecap = async (req, res) => {
  res.json({
    slides: [
      { title: 'You explored 5 days this week', stat: '5', stat_label: 'days outside', description: 'Great job staying connected.' },
      { title: 'You discovered 3 species', stat: '3', stat_label: 'new species', species_list: ['Indian Myna', 'Champa (Plumeria)', 'Banyan Tree'] },
      { title: 'Your top find was the Champa', stat: '97%', stat_label: 'confidence', top_species: { common_name: 'Champa (Plumeria)', scientific_name: 'Plumeria rubra', category: 'flowers' } },
    ],
    total_species: 3,
    total_days: 5,
  });
};

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
  getPlaces,
  getStories,
  createStory,
  deleteStory,
  getCommunityPosts,
  createCommunityPost,
  getActions,
  getStreak,
  getBestTime,
  getWeeklyRecap,
};
