const { Discovery } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');

const discoveryAllowlist = [
  'common_name', 'scientific_name', 'confidence', 'confidence_pct', 'category',
  'description', 'why_it_matters', 'experience_suggestion', 'place_name', 'city',
  'image_url', 'is_public', 'notes', 'raw_analysis',
];

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
    const categoryMap = { plant: 'trees', bird: 'birds', insect: 'insects', mammal: 'mammals', habitat: 'other', water: 'other' };
    const mapped = categoryMap[body.category];
    if (mapped) body.category = mapped;
  }
  const discovery = await Discovery.create({ user: req.user._id, ...body });
  res.status(201).json(discovery);
};

const deleteDiscovery = async (req, res) => {
  const id = req.params.id || req.body?.id;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid discovery id.' });
  const discovery = await Discovery.findOne({ _id: id, user: req.user._id });
  if (!discovery) return res.status(404).json({ error: 'Discovery not found or not yours.' });
  await discovery.deleteOne();
  res.json({ success: true });
};

module.exports = { getDiscoveries, createDiscovery, deleteDiscovery };
