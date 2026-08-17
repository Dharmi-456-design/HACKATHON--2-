const { Profile } = require('../models/Nature');
const { isValidId, pick, sanitizeText } = require('../utils/natureUtils');

const profileAllowlist = [
  'display_name', 'city', 'region', 'available_minutes', 'interests',
  'onboarding_complete', 'saved_places', 'weekly_goals',
];

const getOrCreateProfile = async (user) => {
  let profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    profile = await Profile.create({
      user: user._id,
      display_name: user.name || 'Explorer',
      city: '', region: '', available_minutes: 20,
      interests: [], onboarding_complete: true,
    });
  }
  return profile;
};

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
      if (cleaned && !seen.has(cleaned)) { seen.add(cleaned); places.push(cleaned); }
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
        text, done: Boolean(g?.done),
        created_at: g?.created_at ? new Date(g.created_at) : new Date(),
      });
    }
    updates.weekly_goals = goals;
  }
  Object.assign(profile, updates);
  await profile.save();
  res.json(profile);
};

module.exports = { getProfile, updateProfile, getOrCreateProfile };
