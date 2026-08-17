const { Mission } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');

const missionAllowlist = [
  'title', 'description', 'mission_type', 'duration_minutes', 'status',
  'location_hint', 'why_it_matters', 'scheduled_date', 'completed_at',
];

const missionDefaults = [
  {
    title: 'Listen to tree canopy at dawn',
    description: 'Stand under the largest tree in your neighborhood for 5 minutes without looking at your phone.',
    mission_type: 'observe', duration_minutes: 8,
    location_hint: 'Any nearby tree',
    why_it_matters: 'Slowing down helps tune your sensory system to ambient nature sounds.',
  },
  {
    title: 'Discover 3 native urban flora species',
    description: 'Walk through a neighborhood park and locate 3 different leaf or flower structures. Photograph each structure for Nature Lens.',
    mission_type: 'explore', duration_minutes: 18,
    location_hint: 'Local park or garden bed',
    why_it_matters: 'Identifying native urban flora aids local pollinator habitat tracking.',
  },
  {
    title: 'Map a nocturnal canopy corridor',
    description: 'Identify light pollution hotspots and locate dark canopy corridors where birds and moths shelter overnight.',
    mission_type: 'learn', duration_minutes: 35,
    location_hint: 'Canopy trail or river bank',
    why_it_matters: 'Dark sky corridors are vital for migratory avian telemetry.',
  },
  {
    title: 'Acoustic bird call recording challenge',
    description: 'Record 60 seconds of dawn chorus audio near water bodies or high branches and ask Pulse AI to identify species.',
    mission_type: 'act', duration_minutes: 25,
    location_hint: 'Water edge or dense canopy',
    why_it_matters: 'Bio-acoustic tracking measures avian species density over time.',
  },
];

const getMissions = async (req, res) => {
  const missions = await Mission.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(missions);
};

const createMission = async (req, res) => {
  const raw = req.body || {};
  if (raw.generate) {
    const count = Math.min(Number(raw.count) || 1, 6);
    const minutes = Number(raw.minutes) || null;
    const chosen = missionDefaults.slice(0, count > 1 ? count : 3);
    const created = await Mission.insertMany(
      chosen.map((m, idx) => ({
        ...m,
        user: req.user._id,
        duration_minutes: m.duration_minutes,
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
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid mission id.' });
  const mission = await Mission.findOne({ _id: id, user: req.user._id });
  if (!mission) return res.status(404).json({ error: 'Mission not found or not yours.' });
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
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid mission id.' });
  const mission = await Mission.findOne({ _id: id, user: req.user._id });
  if (!mission) return res.status(404).json({ error: 'Mission not found or not yours.' });
  await mission.deleteOne();
  res.json({ success: true });
};

module.exports = { getMissions, createMission, updateMission, deleteMission };
