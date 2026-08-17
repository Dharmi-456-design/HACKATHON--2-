const { Action, Discovery, JournalEntry, Mission } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');

const actionAllowlist = ['title', 'category', 'status', 'points', 'minutes', 'description', 'image_url', 'impact_note'];

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
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid action id.' });
  const action = await Action.findOne({ _id: id, user: req.user._id });
  if (!action) return res.status(404).json({ error: 'Action not found or not yours.' });
  const updates = pick(req.body || {}, actionAllowlist);
  Object.assign(action, updates);
  await action.save();
  res.json(action);
};

const deleteAction = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid action id.' });
  const action = await Action.findOne({ _id: id, user: req.user._id });
  if (!action) return res.status(404).json({ error: 'Action not found or not yours.' });
  await action.deleteOne();
  res.json({ success: true });
};

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
      condition, best_hour: h,
    });
    return;
  }
  res.json({ suggestion: 'Early morning or late afternoon is often best — most species are most active then.', condition: 'morning' });
};

const getWeeklyRecap = async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const discoveries = await Discovery.find({ user: req.user._id, createdAt: { $gte: weekAgo } }).sort({ createdAt: -1 });

  const activeDays = new Set(discoveries.map((d) => new Date(d.createdAt).toISOString().slice(0, 10))).size;
  const species = discoveries.filter((d) => d.common_name && d.common_name !== 'Natural Flora Observation');
  const totalSpecies = species.length;

  if (!totalSpecies) {
    return res.json({
      slides: [{ title: 'No observations recorded yet this week', stat: '0', stat_label: 'species logged', description: 'Head out with the Lens and make your first discovery of the week.' }],
      total_species: 0, total_days: activeDays,
    });
  }

  const top = species.reduce((best, d) => (d.confidence_pct || 0) >= (best.confidence_pct || 0) ? d : best);
  const names = [...new Set(species.map((d) => d.common_name))].slice(0, 6);

  res.json({
    slides: [
      { title: `You explored ${Math.max(activeDays, 1)} day${activeDays === 1 ? '' : 's'} this week`, stat: String(Math.max(activeDays, 1)), stat_label: 'days outside', description: 'Every observation deepens your local record.' },
      { title: `You discovered ${totalSpecies} species`, stat: String(totalSpecies), stat_label: 'new species', species_list: names },
      { title: `Your top find was ${top.common_name}`, stat: `${top.confidence_pct || '--'}%`, stat_label: 'confidence', top_species: top },
    ],
    total_species: totalSpecies, total_days: activeDays,
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
  const placesVisited = new Set(discoveries.map((d) => (d.place_name || d.city || '').trim()).filter(Boolean)).size;
  const explore = Math.min(100, placesVisited * 25);
  const learn = Math.min(100, entries.length * 20);
  const act = Math.min(100, actions.length * 25);
  const activeDays = new Set(discoveries.concat(entries).map((d) => new Date(d.createdAt).toISOString().slice(0, 10))).size;
  const return_dim = Math.min(100, activeDays * 20);
  const overall = Math.round((observe + explore + learn + act + return_dim) / 5);

  res.json({ observe, explore, learn, act, return_dim, overall });
};

module.exports = { getActions, createAction, updateAction, deleteAction, getStreak, getBestTime, getWeeklyRecap, getConnection };
