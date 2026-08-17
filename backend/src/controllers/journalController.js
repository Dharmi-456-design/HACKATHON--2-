const { JournalEntry } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');

const journalAllowlist = ['title', 'body', 'mood', 'weather', 'place_name', 'image_url'];

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
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid journal id.' });
  const entry = await JournalEntry.findOne({ _id: id, user: req.user._id });
  if (!entry) return res.status(404).json({ error: 'Entry not found or not yours.' });
  await entry.deleteOne();
  res.json({ success: true });
};

module.exports = { getJournal, createJournalEntry, deleteJournalEntry };
