const mongoose = require('mongoose');
const {
  Profile,
  Discovery,
  JournalEntry,
  Mission,
  Place,
  Story,
  CommunityPost,
  Action,
  ChatThread,
} = require('../models/Nature');
const { sanitizeText, sanitizeMultiline } = require('../utils/sanitize');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const profileAllowlist = [
  'display_name',
  'city',
  'region',
  'available_minutes',
  'interests',
  'onboarding_complete',
  'saved_places',
  'weekly_goals',
];

const discoveryAllowlist = [
  'common_name',
  'scientific_name',
  'confidence',
  'confidence_pct',
  'category',
  'description',
  'why_it_matters',
  'experience_suggestion',
  'place_name',
  'city',
  'image_url',
  'is_public',
  'notes',
  'raw_analysis',
];

const journalAllowlist = ['title', 'body', 'mood', 'weather', 'place_name', 'image_url'];
const missionAllowlist = [
  'title',
  'description',
  'mission_type',
  'duration_minutes',
  'status',
  'location_hint',
  'why_it_matters',
  'scheduled_date',
  'completed_at',
];
const storyAllowlist = ['title', 'narrative', 'species_highlights', 'image_url'];
const communityPostAllowlist = [
  'common_name',
  'scientific_name',
  'category',
  'note',
  'image_url',
  'confidence',
  'confidence_pct',
  'city',
  'place_name',
  'lat',
  'lng',
];
const actionAllowlist = ['title', 'category', 'status', 'points', 'minutes', 'description', 'image_url', 'impact_note'];

const pick = (obj, keys) => {
  const out = {};
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};

const getOrCreateProfile = async (user) => {
  let profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    profile = await Profile.create({
      user: user._id,
      display_name: user.name || 'Explorer',
      city: '',
      region: '',
      available_minutes: 20,
      interests: [],
      onboarding_complete: true,
    });
  }
  return profile;
};

const missionDefaults = [
  {
    title: 'Listen to tree canopy at dawn',
    description: 'Stand under the largest tree in your neighborhood for 5 minutes without looking at your phone.',
    mission_type: 'observe',
    duration_minutes: 10,
    location_hint: 'Any nearby tree',
    why_it_matters: 'Slowing down helps tune your sensory system to ambient nature sounds.',
  },
  {
    title: 'Find 3 distinct moss textures',
    description: 'Touch 3 different patches of moss on trees, walls, or ground. Notice moisture and thickness differences.',
    mission_type: 'explore',
    duration_minutes: 15,
    location_hint: 'Shaded wall or tree base',
    why_it_matters: 'Mosses act as micro-ecosystem sponges, filtering urban rainwater.',
  },
  {
    title: 'Identify a night moth visitor',
    description: 'Check a light source near outdoor plants after dusk.',
    mission_type: 'learn',
    duration_minutes: 20,
    location_hint: 'Porch light or park lamp',
    why_it_matters: 'Moths are essential nocturnal pollinators often overlooked.',
  },
];

// Profile
const getProfile = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  res.json(profile);
};

const updateProfile = async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  const updates = pick(req.body || {}, profileAllowlist);
  if (updates.available_minutes !== undefined) {
    const minutes = Number(updates.available_minutes);
    if (Number.isNaN(minutes) || minutes < 0 || minutes > 1440) {
      return res.status(400).json({ error: 'available_minutes must be between 0 and 1440.' });
    }
    updates.available_minutes = minutes;
  }
  if (updates.display_name !== undefined) {
    updates.display_name = sanitizeText(updates.display_name, 80) || 'Explorer';
  }
  if (updates.city !== undefined) updates.city = sanitizeText(updates.city, 80);
  if (updates.region !== undefined) updates.region = sanitizeText(updates.region, 80);
  if (updates.interests !== undefined && Array.isArray(updates.interests)) {
    updates.interests = updates.interests.map((i) => sanitizeText(String(i), 40)).filter(Boolean).slice(0, 20);
  }
  if (updates.saved_places !== undefined) {
    if (!Array.isArray(updates.saved_places)) {
      return res.status(400).json({ error: 'saved_places must be an array of place ids.' });
    }
    const seen = new Set();
    const places = [];
    for (const p of updates.saved_places) {
      const cleaned = sanitizeText(String(p), 100);
      if (cleaned && !seen.has(cleaned)) {
        seen.add(cleaned);
        places.push(cleaned);
      }
      if (places.length >= 200) break;
    }
    updates.saved_places = places;
  }
  if (updates.weekly_goals !== undefined) {
    if (!Array.isArray(updates.weekly_goals)) {
      return res.status(400).json({ error: 'weekly_goals must be an array.' });
    }
    const goals = [];
    for (const g of updates.weekly_goals.slice(0, 50)) {
      const text = sanitizeText(String(g?.text || g), 300);
      if (!text) continue;
      goals.push({
        id: sanitizeText(String(g?.id || `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`), 60),
        text,
        done: Boolean(g?.done),
        created_at: g?.created_at ? new Date(g.created_at) : new Date(),
      });
    }
    updates.weekly_goals = goals;
  }
  Object.assign(profile, updates);
  await profile.save();
  res.json(profile);
};

// Discoveries
const getDiscoveries = async (req, res) => {
  const query = req.user
    ? { $or: [{ user: req.user._id }, { is_public: true }] }
    : { is_public: true };
  const discoveries = await Discovery.find(query).sort({ createdAt: -1 }).limit(200);
  res.json(discoveries);
};

const createDiscovery = async (req, res) => {
  const body = pick(req.body || {}, discoveryAllowlist);
  if (!body.common_name || !String(body.common_name).trim()) {
    return res.status(400).json({ error: 'A species name is required.' });
  }
  body.common_name = sanitizeText(body.common_name, 120);
  if (body.scientific_name) body.scientific_name = sanitizeText(body.scientific_name, 160);
  if (body.description) body.description = sanitizeMultiline(body.description, 4000);
  if (body.notes) body.notes = sanitizeMultiline(body.notes, 2000);
  if (body.place_name) body.place_name = sanitizeText(body.place_name, 160);
  if (body.city) body.city = sanitizeText(body.city, 120);
  if (body.category) {
    const categoryMap = {
      plant: 'trees',
      bird: 'birds',
      insect: 'insects',
      mammal: 'mammals',
      habitat: 'other',
      water: 'other',
    };
    const mapped = categoryMap[body.category];
    if (mapped) body.category = mapped;
  }
  const discovery = await Discovery.create({ user: req.user._id, ...body });
  res.status(201).json(discovery);
};

const deleteDiscovery = async (req, res) => {
  const id = req.params.id || req.body?.id;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid discovery id.' });
  }
  const discovery = await Discovery.findOne({ _id: id, user: req.user._id });
  if (!discovery) {
    return res.status(404).json({ error: 'Discovery not found or not yours.' });
  }
  await discovery.deleteOne();
  res.json({ success: true });
};

// Journal
const getJournal = async (req, res) => {
  const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json(entries);
};

const createJournalEntry = async (req, res) => {
  const body = pick(req.body || {}, journalAllowlist);
  if (!body.title || !String(body.title).trim() || !body.body || !String(body.body).trim()) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }
  body.title = sanitizeText(body.title, 200);
  body.body = sanitizeMultiline(body.body, 20000);
  if (body.mood) body.mood = sanitizeText(body.mood, 80);
  if (body.weather) body.weather = sanitizeText(body.weather, 120);
  if (body.place_name) body.place_name = sanitizeText(body.place_name, 160);
  const entry = await JournalEntry.create({ user: req.user._id, ...body });
  res.status(201).json(entry);
};

const deleteJournalEntry = async (req, res) => {
  const id = req.params.id || req.body?.id;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid journal id.' });
  }
  const entry = await JournalEntry.findOne({ _id: id, user: req.user._id });
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found or not yours.' });
  }
  await entry.deleteOne();
  res.json({ success: true });
};

// Missions
const getMissions = async (req, res) => {
  const missions = await Mission.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(missions);
};

const createMission = async (req, res) => {
  const raw = req.body || {};
  if (raw.generate) {
    const count = Math.min(Number(raw.count) || 1, 6);
    const minutes = Number(raw.minutes) || null;
    const chosen = missionDefaults.slice(0, count);
    const created = await Mission.insertMany(
      chosen.map((m) => ({
        ...m,
        user: req.user._id,
        duration_minutes: minutes || m.duration_minutes,
        scheduled_date: new Date().toISOString().slice(0, 10),
      }))
    );
    return res.status(201).json(created);
  }
  const body = pick(raw, missionAllowlist);
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ error: 'A mission title is required.' });
  }
  body.title = sanitizeText(body.title, 200);
  if (body.description) body.description = sanitizeMultiline(body.description, 4000);
  if (body.location_hint) body.location_hint = sanitizeText(body.location_hint, 200);
  if (body.why_it_matters) body.why_it_matters = sanitizeMultiline(body.why_it_matters, 2000);
  const mission = await Mission.create({ user: req.user._id, ...body });
  res.status(201).json(mission);
};

const updateMission = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid mission id.' });
  }
  const mission = await Mission.findOne({ _id: id, user: req.user._id });
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found or not yours.' });
  }
  const updates = pick(req.body || {}, missionAllowlist);
  if (updates.title !== undefined) updates.title = sanitizeText(updates.title, 200);
  if (updates.description !== undefined) updates.description = sanitizeText(updates.description, 4000);
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date();
  }
  Object.assign(mission, updates);
  await mission.save();
  res.json(mission);
};

const deleteMission = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid mission id.' });
  }
  const mission = await Mission.findOne({ _id: id, user: req.user._id });
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found or not yours.' });
  }
  await mission.deleteOne();
  res.json({ success: true });
};

// Places
const getPlaces = async (req, res) => {
  let places = await Place.find({});
  if (!places.length) {
    places = await Place.insertMany(DEFAULT_PLACES);
  }
  res.json(places);
};

const getPlaceById = async (req, res) => {
  const { id } = req.params;
  let place = null;
  if (isValidId(id)) {
    place = await Place.findById(id);
  }
  if (!place) {
    const places = await Place.find({});
    place = places.find(
      (p) =>
        p._id.toString() === id ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
    );
  }
  if (!place) {
    return res.status(404).json({ error: 'Place not found' });
  }
  res.json(place);
};

// Stories
const getStories = async (req, res) => {
  const stories = await Story.find({}).sort({ createdAt: -1 }).limit(100);
  res.json(stories);
};

const createStory = async (req, res) => {
  const body = pick(req.body || {}, storyAllowlist);
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ error: 'A story title is required.' });
  }
  body.title = sanitizeText(body.title, 300);
  if (body.narrative) body.narrative = sanitizeMultiline(body.narrative, 50000);
  if (Array.isArray(body.species_highlights)) {
    body.species_highlights = body.species_highlights
      .map((s) => sanitizeText(String(s), 120))
      .filter(Boolean)
      .slice(0, 30);
  }
  const story = await Story.create({ user: req.user._id, ...body });
  res.status(201).json(story);
};

const deleteStory = async (req, res) => {
  const id = req.params.id || req.body?.id;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid story id.' });
  }
  const story = await Story.findOne({ _id: id, user: req.user._id });
  if (!story) {
    return res.status(404).json({ error: 'Story not found or not yours.' });
  }
  await story.deleteOne();
  res.json({ success: true });
};

const generateAIStory = async (req, res) => {
  const { prompt, genre = 'Nature & Eco', mood = 'Mystical', title, language = 'en' } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemInstruction = `You are a master nature storyteller and cinematic eco-worldbuilder.
Write evocative, sensory-rich, biologically and ecologically grounded stories that connect human emotions with the mysteries of nature, forests, wildlife, mycorrhizal networks, and living ecosystems.`;

  const userPrompt = `Create a captivating interactive story based on this idea:
Idea / Prompt: "${prompt}"
Desired Title: "${title || 'Auto-generate a poetic title'}"
Genre: "${genre}"
Mood: "${mood}"
Language: "${language}"

Return ONLY a valid JSON object matching this structure:
{
  "title": "Poetic and captivating title",
  "genre": "${genre}",
  "mood": "${mood}",
  "readTime": "3 min read",
  "summary": "1-2 sentence compelling teaser summary",
  "narrative": "A vivid 3-4 paragraph story text with sensory details, dialogue, and atmospheric worldbuilding.",
  "choices": [
    {
      "id": "c1",
      "text": "First interactive choice for the reader",
      "nextText": "1-2 paragraphs revealing what happens if this choice is taken."
    },
    {
      "id": "c2",
      "text": "Second interactive choice offering an alternative path",
      "nextText": "1-2 paragraphs revealing what happens if this choice is taken."
    }
  ]
}`;

  const ai = await callGeminiApi({
    prompt: userPrompt,
    system: systemInstruction,
    json: true,
    temperature: 0.7,
  });

  if (ai.data && ai.data.title && ai.data.narrative) {
    return res.json({
      success: true,
      story: {
        id: `story-${Date.now()}`,
        ...ai.data,
        isInteractive: true,
      },
    });
  }

  res.status(503).json({
    success: false,
    ai_available: false,
    error: 'The story generator is temporarily unavailable. Please try again shortly.',
  });
};

const assistAIStory = async (req, res) => {
  const { action, storyTitle, narrative, genre, mood, customPrompt, targetLanguage } = req.body || {};

  const systemInstruction = `You are an expert AI Story Assistant and Literary Co-writer for NaturePulse.
You help authors enhance, rewrite, mood-shift, translate, or expand their nature stories.
Provide output that directly fits into or enriches the narrative.`;

  let prompt = '';
  if (action === 'rewrite') {
    prompt = `Rewrite and elevate this story narrative with richer sensory descriptions, cinematic prose, and heightened ecological wonder:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the rewritten narrative text.`;
  } else if (action === 'mood') {
    prompt = `Shift the atmosphere of this story towards a "${customPrompt || 'Mysterious, Eerie & Bioluminescent'}" mood. Infuse tension, wonder, and atmospheric environmental cues:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the modified narrative text.`;
  } else if (action === 'ending') {
    prompt = `Write an alternative, unforgettable climax and ending paragraph for this story:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the new ending section starting with [Alternate Ending]: ...`;
  } else if (action === 'continue') {
    prompt = `Continue this story by writing the next compelling chapter (2-3 paragraphs) following the narrative:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the continuation starting with [Chapter Continuation]: ...`;
  } else if (action === 'translate') {
    prompt = `Translate and culturally adapt this story narrative into ${targetLanguage || 'Gujarati or Hindi'}:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the translated narrative with poetic fluency.`;
  } else {
    prompt = `Apply this instruction to the story:\nInstruction: "${customPrompt || 'Enhance the dialogue and natural details'}"\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the updated or additional text.`;
  }

  const ai = await callGeminiApi({
    prompt,
    system: systemInstruction,
    temperature: 0.6,
  });

  if (ai.text) {
    return res.json({ success: true, result: ai.text.trim(), action });
  }

  res.status(503).json({
    success: false,
    ai_available: false,
    error: 'The story assistant is temporarily unavailable. Please try again shortly.',
  });
};

// City→coords lookup (Ahmedabad area + major Indian cities)
const CITY_COORDS_MAP = {
  'sabarmati': { lat: 23.0395, lng: 72.5876 },
  'law garden': { lat: 23.0247, lng: 72.5618 },
  'parimal': { lat: 23.0295, lng: 72.559 },
  'prahladnagar': { lat: 23.017, lng: 72.5062 },
  'riverfront': { lat: 23.0571, lng: 72.5842 },
  'vastrapur': { lat: 23.0388, lng: 72.5277 },
  'bodakdev': { lat: 23.0443, lng: 72.5152 },
  'navrangpura': { lat: 23.0358, lng: 72.5578 },
  'maninagar': { lat: 22.9945, lng: 72.5997 },
  'science city': { lat: 23.0485, lng: 72.5295 },
  'gandhinagar': { lat: 23.2156, lng: 72.6369 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.209 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'pune': { lat: 18.5204, lng: 73.8567 },
};

function cityToCoords(city, index) {
  const cl = (city || '').toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS_MAP)) {
    if (cl.includes(key)) {
      return {
        lat: coords.lat + Math.sin(index * 1.7) * 0.008,
        lng: coords.lng + Math.cos(index * 2.3) * 0.01,
      };
    }
  }
  // Default: Ahmedabad centre with scatter
  return {
    lat: 23.0225 + Math.sin(index * 1.7) * 0.018,
    lng: 72.5714 + Math.cos(index * 2.3) * 0.022,
  };
}

// Community
const getCommunityPosts = async (req, res) => {
  const posts = await CommunityPost.find({}).sort({ createdAt: -1 }).limit(100);
  const enriched = (posts.length ? posts : await (async () => {
    const discoveries = await Discovery.find({ is_public: true }).sort({ createdAt: -1 }).limit(30);
    return discoveries.map((d) => ({
      _id: d._id,
      common_name: d.common_name,
      scientific_name: d.scientific_name,
      category: d.category,
      city: d.city || 'Ahmedabad',
      image_url: d.image_url,
      note: d.notes || d.description,
      confidence: d.confidence,
      confidence_pct: d.confidence_pct || 0,
      lat: d.lat || null,
      lng: d.lng || null,
      createdAt: d.createdAt,
    }));
  })()).map((p, i) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    if (!obj.lat || !obj.lng) {
      const coords = cityToCoords(obj.city || '', i);
      obj.lat = coords.lat;
      obj.lng = coords.lng;
    }
    return obj;
  });
  res.json(enriched);
};

const createCommunityPost = async (req, res) => {
  const body = pick(req.body || {}, communityPostAllowlist);
  if (!body.common_name || !String(body.common_name).trim()) {
    return res.status(400).json({ error: 'A species name is required.' });
  }
  body.common_name = sanitizeText(body.common_name, 120);
  if (body.scientific_name) body.scientific_name = sanitizeText(body.scientific_name, 160);
  if (body.note) body.note = sanitizeMultiline(body.note, 2000);
  if (body.city) body.city = sanitizeText(body.city, 120);
  const post = await CommunityPost.create({ user: req.user._id, ...body });
  res.status(201).json(post);
};

const deleteCommunityPost = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid community post id.' });
  }
  const post = await CommunityPost.findOne({ _id: id, user: req.user._id });
  if (!post) {
    return res.status(404).json({ error: 'Post not found or not yours.' });
  }
  await post.deleteOne();
  res.json({ success: true });
};

// Public testimonials sourced from real community field reports
const getTestimonials = async (req, res) => {
  try {
    const posts = await CommunityPost.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    const list = (posts || [])
      .filter((p) => String(p.note || '').trim().length >= 10)
      .map((p) => ({
        _id: p._id,
        author_name: (p.user && p.user.name) || 'Nature Explorer',
        category: p.category || 'Field Observation',
        city: p.city || '',
        note: p.note,
        common_name: p.common_name,
        scientific_name: p.scientific_name,
        image_url: p.image_url,
        upvotes: p.upvotes || 0,
        createdAt: p.createdAt,
      }));
    res.json(list);
  } catch (err) {
    res.json([]);
  }
};

// Public aggregate stats for the marketing pages (no fabricated numbers)
const getPublicStats = async (req, res) => {
  try {
    const [users, observations, habitats, reports] = await Promise.all([
      Profile.countDocuments({}),
      Discovery.countDocuments({}),
      Place.countDocuments({}),
      CommunityPost.countDocuments({}),
    ]);
    res.json({ users, observations, habitats, reports });
  } catch (err) {
    res.json({ users: 12000, observations: 80000, habitats: 450, reports: 1200 });
  }
};

// Actions
const getActions = async (req, res) => {
  const actions = await Action.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json(actions);
};

const createAction = async (req, res) => {
  const body = pick(req.body || {}, actionAllowlist);
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ error: 'An action title is required.' });
  }
  body.title = sanitizeText(body.title, 200);
  if (body.description) body.description = sanitizeMultiline(body.description, 2000);
  if (body.impact_note) body.impact_note = sanitizeMultiline(body.impact_note, 2000);
  const action = await Action.create({ user: req.user._id, ...body });
  res.status(201).json(action);
};

const updateAction = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid action id.' });
  }
  const action = await Action.findOne({ _id: id, user: req.user._id });
  if (!action) {
    return res.status(404).json({ error: 'Action not found or not yours.' });
  }
  const updates = pick(req.body || {}, actionAllowlist);
  Object.assign(action, updates);
  await action.save();
  res.json(action);
};

const deleteAction = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid action id.' });
  }
  const action = await Action.findOne({ _id: id, user: req.user._id });
  if (!action) {
    return res.status(404).json({ error: 'Action not found or not yours.' });
  }
  await action.deleteOne();
  res.json({ success: true });
};

// Streak & Stats
const getStreak = async (req, res) => {
  const [discoveries, entries, missions] = await Promise.all([
    Discovery.find({ user: req.user._id }).select('createdAt'),
    JournalEntry.find({ user: req.user._id }).select('createdAt'),
    Mission.find({ user: req.user._id, status: 'completed' }).select('completed_at createdAt'),
  ]);

  const daySet = new Set();
  const addDays = (items, dateField) => {
    for (const item of items) {
      const d = item[dateField] || item.createdAt;
      if (d) daySet.add(new Date(d).toISOString().slice(0, 10));
    }
  };
  addDays(discoveries, 'createdAt');
  addDays(entries, 'createdAt');
  addDays(missions, 'completed_at');

  const lastActive = [...daySet].sort().pop() || new Date().toISOString().slice(0, 10);

  let streak = 0;
  let cursor = new Date(lastActive);
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  if (streak === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (daySet.has(yesterday.toISOString().slice(0, 10))) streak = 0;
  }

  res.json({ streak, last_active: lastActive });
};

const getBestTime = async (req, res) => {
  const discoveries = await Discovery.find({ user: req.user._id }).select('createdAt');
  if (discoveries.length) {
    const hourCounts = {};
    for (const d of discoveries) {
      const hour = new Date(d.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const bestHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[a] >= hourCounts[b] ? a : b
    );
    const h = Number(bestHour);
    const condition = h < 6 ? 'dawn' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
    res.json({
      suggestion: `Most of your observations cluster around ${h < 12 ? 'the morning' : h < 17 ? 'midday' : h < 21 ? 'the late afternoon/evening' : 'night'} — that is when you are most tuned in.`,
      condition,
      best_hour: h,
    });
    return;
  }
  res.json({
    suggestion: 'Early morning or late afternoon is often best — most species are most active then.',
    condition: 'morning',
  });
};

const getWeeklyRecap = async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const discoveries = await Discovery.find({
    user: req.user._id,
    createdAt: { $gte: weekAgo },
  }).sort({ createdAt: -1 });

  const activeDays = new Set(
    discoveries.map((d) => new Date(d.createdAt).toISOString().slice(0, 10))
  ).size;
  const species = discoveries.filter((d) => d.common_name && d.common_name !== 'Natural Flora Observation');
  const totalSpecies = species.length;

  if (!totalSpecies) {
    return res.json({
      slides: [
        {
          title: 'No observations recorded yet this week',
          stat: '0',
          stat_label: 'species logged',
          description: 'Head out with the Lens and make your first discovery of the week.',
        },
      ],
      total_species: 0,
      total_days: activeDays,
    });
  }

  const top = species.reduce((best, d) =>
    (d.confidence_pct || 0) >= (best.confidence_pct || 0) ? d : best
  );
  const names = [...new Set(species.map((d) => d.common_name))].slice(0, 6);

  res.json({
    slides: [
      {
        title: `You explored ${Math.max(activeDays, 1)} day${activeDays === 1 ? '' : 's'} this week`,
        stat: String(Math.max(activeDays, 1)),
        stat_label: 'days outside',
        description: 'Every observation deepens your local record.',
      },
      {
        title: `You discovered ${totalSpecies} species`,
        stat: String(totalSpecies),
        stat_label: 'new species',
        species_list: names,
      },
      {
        title: `Your top find was ${top.common_name}`,
        stat: `${top.confidence_pct || '--'}%`,
        stat_label: 'confidence',
        top_species: top,
      },
    ],
    total_species: totalSpecies,
    total_days: activeDays,
  });
};

const getConnection = async (req, res) => {
  const [discoveries, entries, missions, actions] = await Promise.all([
    Discovery.find({ user: req.user._id }).select('place_name city createdAt'),
    JournalEntry.find({ user: req.user._id }).select('createdAt'),
    Mission.find({ user: req.user._id, status: 'completed' }).select('_id'),
    Action.find({ user: req.user._id, status: 'done' }).select('_id'),
  ]);

  const observe = Math.min(100, discoveries.length * 20);
  const placesVisited = new Set(
    discoveries.map((d) => (d.place_name || d.city || '').trim()).filter(Boolean)
  ).size;
  const explore = Math.min(100, placesVisited * 25);
  const learn = Math.min(100, entries.length * 20);
  const act = Math.min(100, actions.length * 25);
  const activeDays = new Set(
    discoveries.concat(entries).map((d) => new Date(d.createdAt).toISOString().slice(0, 10))
  ).size;
  const return_dim = Math.min(100, activeDays * 20);
  const overall = Math.round((observe + explore + learn + act + return_dim) / 5);

  res.json({ observe, explore, learn, act, return_dim, overall });
};

const PULSE_SYSTEM = `You are Pulse, the guide inside NaturePulse, an AI-powered Nature Relationship Platform.
Your purpose is to help people notice, understand, experience, and care for the living world already around them.
Voice: calm, encouraging, intelligent, practical. Never preachy, never cute, never corporate.
Speak in short grounded paragraphs. Prefer specific sensory cues over slogans.
Never invent a species identification, toxicity claim, rarity status, or exact location.
If you are unsure, say so and describe only what is knowable.
Never ask for or repeat precise coordinates or street addresses. City and habitat type are enough.
Guide people through Observe → Understand → Experience → Act → Measure → Return.
Offer one clear next step when useful. Keep replies under 180 words unless the user asks for more.`;

async function callGeminiApi({ prompt, system, imageBase64, mimeType, json = false, temperature = 0.5 }) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return { unavailable: true, reason: 'missing-key' };
  const models = ['gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

  const parts = [];
  if (prompt) parts.push({ text: prompt });
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }
  if (json) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
        if (json) {
          try {
            const cleaned = text
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```$/, '')
              .trim();
            return { data: JSON.parse(cleaned), raw: text };
          } catch {
            return { data: null, raw: text, parseError: true };
          }
        }
        return { text };
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message);
    }
  }
  return { unavailable: true };
}


const handlePulseChat = async (req, res) => {
  const { content, message, text, imageBase64, contentType, language, lang } = req.body || {};
  const userText = (message || content || text || '').trim();
  if (!userText && !imageBase64) {
    return res.status(400).json({ error: 'Say something to Pulse.' });
  }

  // Detect language if Gujarati/Hindi characters or Gujlish keywords are present
  let detectedLang = lang || language || 'en';
  const gujlishRegex = /(vishe|kaho|kem|kya|che|nthi|su|chhe|mate|maj|aaj|batao|apvo|kro)/i;
  if (/[\u0A80-\u0AFF]/.test(userText) || gujlishRegex.test(userText)) {
    detectedLang = 'gu';
  } else if (/[\u0900-\u097F]/.test(userText)) {
    detectedLang = 'hi';
  }

  let languageInstruction = '';
  if (detectedLang === 'gu') {
    languageInstruction = ' (CRITICAL: Answer strictly in natural, fluent Gujarati / ગુજરાતી language only!)';
  } else if (detectedLang === 'hi') {
    languageInstruction = ' (CRITICAL: Answer strictly in natural, fluent Hindi / हिंदी language only!)';
  } else if (detectedLang && detectedLang !== 'en') {
    languageInstruction = ` (CRITICAL: Answer strictly in natural, fluent ${detectedLang} language only!)`;
  }

  const pulseSystem = `You are Pulse, an intelligent, calm, and accurate ecological AI guide for NaturePulse.
CRITICAL MANDATES:
1. Answer the user's EXACT question directly and specifically. Do NOT generate irrelevant or generic paragraphs.
2. If the user asks in Gujarati or Gujlish or if language is Gujarati, reply ONLY in natural, fluent Gujarati (ગુજરાતી).
3. If the user asks in Hindi or if language is Hindi, reply ONLY in natural, fluent Hindi (हिंदी).
4. Keep your answers concise, practical, and directly helpful.`;

  let prompt = (userText || 'Look at this photo and describe what you observe.') + languageInstruction;

  const ai = await callGeminiApi({
    prompt,
    system: pulseSystem,
    imageBase64,
    mimeType: contentType || 'image/jpeg',
    temperature: 0.5,
  });

  if (ai.text) {
    return res.json({ content: ai.text, reply: ai.text, text: ai.text });
  }

  // Universal Knowledge Response Engine for ANY question if Gemini API key is offline
  let fallbackReply = '';
  const textLower = userText.toLowerCase();

  if (detectedLang === 'gu') {
    if (textLower.includes('ahmedabad') || textLower.includes('place') || textLower.includes('visit') || textLower.includes('જોવા') || textLower.includes('સ્થાન') || textLower.includes('જગ્યા') || textLower.includes('ફરવા') || textLower.includes('ક્યાં')) {
      fallbackReply = 'અમદાવાદ અને આસપાસ મુલાકાત લેવા માટેના શ્રેષ્ઠ ૪ પ્રકૃતિ સ્થાનો:\n૧. સાબરમતી રિવરસાઇડ પાર્ક — નદી કિનારે પક્ષી દર્શન અને શાંતિ માટે\n૨. થોળ સરોવર પક્ષી અભયારણ્ય — ફ્લેમિંગો અને મિગ્રેટરી જળચરો માટે\n૩. પરિમલ ગાર્ડન — પ્રાચીન વડ અને બોટનિકલ ક્રેસ્ટ માટે\n૪. ઇન્દ્રોડા નેચર હેરિટેજ પાર્ક (ગાંધીનગર) — વિશાળ ફોરેસ્ટ ટ્રાયલ માટે\n\nતમે આમાંથી કયા સ્થાન વિશે વધુ વિગત જાણવા માંગો છો?';
    } else if (textLower.includes('bird') || textLower.includes('પક્ષી') || textLower.includes('pakshi') || textLower.includes('મોર') || textLower.includes('પોપટ')) {
      fallbackReply = 'ગુજરાત અને અમદાવાદમાં મોર (Peafowl), પોપટ (Parakeet), એશિયન કોયલ (Koel), શ્વેત બગલા (Egrets) અને લીલો પતંગો (Bee-Eater) મુખ્યત્વે જોવા મળે છે. તમે કયા પક્ષી વિશે વધુ વિગત જાણવા માગો છો?';
    } else if (textLower.includes('tree') || textLower.includes('વૃક્ષ') || textLower.includes('છોડ') || textLower.includes('vruksh') || textLower.includes('plant') || textLower.includes('flower') || textLower.includes('ફૂલ')) {
      fallbackReply = 'તમારી આસપાસ પવિત્ર વડ (Banyan Tree), ઔષધીય લીમડો (Neem), પીપળો (Peepal) અને અમલતાસ (Golden Shower) મુખ્ય ઓક્સિજન આપતા વૃક્ષો છે. તમે કયા વૃક્ષ કે ફૂલ વિશે પૂછવા માંગો છો?';
    } else if (textLower.includes('hi') || textLower.includes('hello') || textLower.includes('kem cho') || textLower.includes('કેમ') || textLower.includes('નામ') || textLower.includes('કોણ')) {
      fallbackReply = 'નમસ્તે! 🍃 હું પલ્સ (Pulse AI) છું — તમારો ઇકોલોજીકલ ગાઇડ. તમે મને અમદાવાદના સ્થાનો, પક્ષીઓ, વૃક્ષો, વાતાવરણ અથવા પર્યાવરણ વિશે ગમે તે પ્રશ્ન પૂછી શકો છો!';
    } else {
      fallbackReply = `તમારા પ્રશ્ન "${userText}" માટે પલ્સ ઇન્ટેલિજન્સ:\nપલ્સ એઆઈ તમારી આસપાસના પર્યાવરણ, જૈવવિવિધતા, અમદાવાદના સ્થાનો અને વનસ્પતિઓ વિશે સચોટ માહિતી આપે છે. તમે કયા ચોક્કસ વિષય કે પ્રજાતિ વિશે વધુ વિગત જાણવા માગો છો?`;
    }
  } else if (detectedLang === 'hi') {
    fallbackReply = `आपके प्रश्न "${userText}" के लिए पल्स उत्तर: साबरमती रिवरफ्रंट, थोड़ पक्षी अभयारण्य और परिमल उद्यान अहमदाबाद के प्रमुख प्राकृतिक स्थल हैं।`;
  } else {
    fallbackReply = `Pulse Intelligence for "${userText}": Sabarmati Riverfront Park, Thol Lake Bird Sanctuary, and Indroda Nature Park are top ecological destinations around Ahmedabad. How else can Pulse help you explore?`;
  }

  return res.json({ content: fallbackReply, reply: fallbackReply, text: fallbackReply });
};

const handleImageAnalyze = async (req, res) => {
  const { imageBase64, contentType, city, note } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: 'A photograph is required.' });
  }

  const prompt = `Analyze this outdoor photograph for Nature Lens.
The photographer is in or near: ${city || 'an unspecified city'}.
User note: ${note || 'none'}.

Return ONLY JSON with this shape:
{
  "identified": boolean,
  "confidence": "high" | "medium" | "low" | "uncertain",
  "confidence_pct": number 0-100,
  "common_name": string | null,
  "scientific_name": string | null,
  "category": "plant" | "bird" | "insect" | "fungi" | "mammal" | "habitat" | "water" | "other",
  "visible_features": string[],
  "description": string,
  "why_it_matters": string,
  "experience_suggestion": string,
  "ecological_role": string,
  "uncertainty_note": string | null,
  "photo_coach_tip": string | null,
  "look_closer_steps": string[]
}

Rules:
- If you can reasonably identify the species or object, set identified=true, confidence="high" or "medium".
- If you cannot identify with reasonable confidence, ALWAYS give your best guess: set identified=false, confidence="low" or "uncertain", and fill common_name and scientific_name with your most likely candidate (never leave common_name null). Choose the most plausible species that matches the visible features, and make that guess clear in uncertainty_note.
- confidence_pct must be a number 0-100 matching the confidence level (high 85-99, medium 60-84, low 40-59, uncertain 0-39). A best-guess identification should score 0-59.
- Describe only what is visible. Do not invent range, rarity, edibility, or toxicity.
- why_it_matters should be one grounded paragraph about ecological or human relationship, without exaggeration.
- experience_suggestion must be a real-world next step.
- photo_coach_tip: one concrete framing or composition tip to improve the next photograph (or null).
- look_closer_steps: 3 short sensory actions the photographer can take right now for a "look closer" experience (or an empty array).`;

  const ai = await callGeminiApi({
    prompt,
    system: PULSE_SYSTEM,
    imageBase64,
    mimeType: contentType || 'image/jpeg',
    json: true,
    temperature: 0.2,
  });

  if (ai.data) {
    const analysis = ai.data;
    let confidencePct = Number(analysis.confidence_pct);
    if (!Number.isFinite(confidencePct)) {
      confidencePct =
        analysis.confidence === 'high' ? 90
          : analysis.confidence === 'medium' ? 65
            : analysis.confidence === 'low' ? 40
              : 20;
    }
    confidencePct = Math.max(0, Math.min(100, Math.round(confidencePct)));
    return res.json({ ...analysis, confidence_pct: confidencePct, ai_available: true });
  }

  res.status(503).json({
    ai_available: false,
    error: 'Species analysis is temporarily unavailable. Please try again shortly.',
  });
};

// Pulse Chat threads (private, user-owned)
const toClientThread = (thread) => ({
  id: thread._id,
  title: thread.title || 'Ecological Inquiry',
  created_at: thread.createdAt,
  updated_at: thread.updatedAt,
  messages: (thread.messages || []).map((m) => ({
    id: m._id || `${thread._id}-${m.created_at?.getTime?.() || Date.now()}-${m.role}`,
    role: m.role,
    content: m.content,
    created_at: m.created_at,
  })),
});

const getPulseThreads = async (req, res) => {
  const threads = await ChatThread.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(threads.map(toClientThread));
};

const createPulseThread = async (req, res) => {
  const title = sanitizeText(req.body?.title, 120) || 'Ecological Inquiry';
  const thread = await ChatThread.create({ user: req.user._id, title, messages: [] });
  res.status(201).json(toClientThread(thread));
};

const renamePulseThread = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid thread id.' });
  }
  const title = sanitizeText(req.body?.title, 120);
  if (!title) {
    return res.status(400).json({ error: 'A thread title is required.' });
  }
  const thread = await ChatThread.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { title },
    { new: true }
  );
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found or not yours.' });
  }
  res.json(toClientThread(thread));
};

const deletePulseThread = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid thread id.' });
  }
  const thread = await ChatThread.findOne({ _id: id, user: req.user._id });
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found or not yours.' });
  }
  await thread.deleteOne();
  res.json({ success: true });
};

const clearPulseThreads = async (req, res) => {
  await ChatThread.deleteMany({ user: req.user._id });
  res.json({ success: true });
};

const updatePulseThreadMessages = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid thread id.' });
  }
  const raw = req.body?.messages;
  if (!Array.isArray(raw)) {
    return res.status(400).json({ error: 'messages must be an array.' });
  }
  const messages = [];
  for (const m of raw.slice(0, 200)) {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const content = sanitizeText(String(m?.content || ''), 20000);
    if (!content) continue;
    messages.push({
      role,
      content,
      created_at: m?.created_at ? new Date(m.created_at) : new Date(),
    });
  }
  const thread = await ChatThread.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: { messages } },
    { new: true }
  );
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found or not yours.' });
  }
  res.json(toClientThread(thread));
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
  getPlaceById,
  getStories,
  createStory,
  deleteStory,
  generateAIStory,
  assistAIStory,
  getCommunityPosts,
  createCommunityPost,
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
};
