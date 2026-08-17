const { CommunityPost, Discovery } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');

const communityPostAllowlist = [
  'common_name', 'scientific_name', 'category', 'note', 'image_url',
  'confidence', 'confidence_pct', 'city', 'place_name', 'lat', 'lng',
];

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
  return { lat: 23.0225 + Math.sin(index * 1.7) * 0.018, lng: 72.5714 + Math.cos(index * 2.3) * 0.022 };
}

const getCommunityPosts = async (req, res) => {
  const posts = await CommunityPost.find({}).sort({ createdAt: -1 }).limit(100);
  const enriched = (posts.length ? posts : await (async () => {
    const discoveries = await Discovery.find({ is_public: true }).sort({ createdAt: -1 }).limit(30);
    return discoveries.map((d) => ({
      _id: d._id, common_name: d.common_name, scientific_name: d.scientific_name,
      category: d.category, city: d.city || 'Ahmedabad', image_url: d.image_url,
      note: d.notes || d.description, confidence: d.confidence,
      confidence_pct: d.confidence_pct || 0, lat: d.lat || null, lng: d.lng || null,
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
  if (body.lat !== undefined) body.lat = Number(body.lat);
  if (body.lng !== undefined) body.lng = Number(body.lng);
  const post = await CommunityPost.create({ user: req.user._id, ...body });
  res.status(201).json(post);
};

const deleteCommunityPost = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid community post id.' });
  const post = await CommunityPost.findOne({ _id: id, user: req.user._id });
  if (!post) return res.status(404).json({ error: 'Post not found or not yours.' });
  await post.deleteOne();
  res.json({ success: true });
};

const getTestimonials = async (req, res) => {
  try {
    const posts = await CommunityPost.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(50);
    const list = (posts || [])
      .filter((p) => String(p.note || '').trim().length >= 10)
      .map((p) => ({
        _id: p._id, author_name: (p.user && p.user.name) || 'Nature Explorer',
        category: p.category || 'Field Observation', city: p.city || '', note: p.note,
        common_name: p.common_name, scientific_name: p.scientific_name,
        image_url: p.image_url, upvotes: p.upvotes || 0, createdAt: p.createdAt,
      }));
    res.json(list);
  } catch {
    res.json([]);
  }
};

const getPublicStats = async (req, res) => {
  try {
    const { Profile } = require('../models/Nature');
    const { Place } = require('../models/Nature');
    const [users, observations, habitats, reports] = await Promise.all([
      Profile.countDocuments({}),
      Discovery.countDocuments({}),
      Place.countDocuments({}),
      CommunityPost.countDocuments({}),
    ]);
    res.json({ users, observations, habitats, reports });
  } catch {
    res.status(500).json({ error: 'Unable to load statistics' });
  }
};

module.exports = { getCommunityPosts, createCommunityPost, deleteCommunityPost, getTestimonials, getPublicStats };
