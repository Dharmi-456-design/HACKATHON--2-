import React from 'react';
  
  const RecapController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default RecapController;
  const { Discovery, JournalEntry, Mission, Action, Profile, ChatThread, WeeklyRecapSnapshot } = require('../models/Nature');
const { isValidId } = require('../utils/natureUtils');

// Helper to format ISO date to YYYY-MM-DD
const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

// Helper for human date range string
const formatDateRange = (start, end) => {
  const opts = { month: 'short', day: 'numeric' };
  const sStr = start.toLocaleDateString('en-US', opts);
  const eStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${sStr} – ${eStr}`;
};

// Generate ecological synthesis text dynamically
const generateSynthesis = (metrics, lang = 'en') => {
  const { totalSpecies, totalObs, activeDays, mostActiveDay, topCategory, topSpeciesName, placesCount, goalsCompleted, goalsTotal } = metrics;

  if (totalObs === 0) {
    if (lang === 'gu') {
      return 'આ અઠવાડિયે હજુ સુધી કોઈ પ્રવૃત્તિ નોંધાઈ નથી. નેચર લેન્સ સાથે બહાર નીકળો અને તમારી પ્રથમ શોધ રેકોર્ડ કરો.';
    }
    if (lang === 'hi') {
      return 'इस सप्ताह अभी तक कोई अवलोकन दर्ज नहीं किया गया है। नेचर लेंस के साथ बाहर निकलें और अपनी पहली खोज रिकॉर्ड करें।';
    }
    return 'No observations recorded yet this week. Head out with the Lens and make your first discovery to ignite your ecological cosmos.';
  }

  const parts = [];
  if (totalSpecies > 0) {
    parts.push(`You documented ${totalSpecies} distinct species across ${totalObs} field observation${totalObs === 1 ? '' : 's'}`);
  }
  if (topSpeciesName) {
    parts.push(`with notable focus on ${topSpeciesName}`);
  }
  if (topCategory) {
    parts.push(`leading biodiversity in ${topCategory}`);
  }
  if (mostActiveDay && mostActiveDay !== '—') {
    parts.push(`Peak exploration occurred on ${mostActiveDay}`);
  }
  if (placesCount > 0) {
    parts.push(`spanning ${placesCount} habitat area${placesCount === 1 ? '' : 's'}`);
  }
  if (goalsTotal > 0) {
    parts.push(`achieving ${goalsCompleted} of ${goalsTotal} weekly milestones`);
  }

  const enSummary = parts.length > 0 ? parts.join(', ') + '.' : 'A productive week of nature observation and biodiversity tracking.';

  if (lang === 'gu') {
    return `આ અઠવાડિયે તમે ${totalSpecies} પ્રજાતિઓ અને ${totalObs} અવલોકનો નોંધ્યા.${mostActiveDay !== '—' ? ` સૌથી વધુ સક્રિય દિવસ ${mostActiveDay} રહ્યો.` : ''}${topCategory ? ` મુખ્ય વિષય ${topCategory} રહ્યો.` : ''}`;
  }
  if (lang === 'hi') {
    return `इस सप्ताह आपने ${totalSpecies} प्रजातियों और ${totalObs} अवलोकनों को रिकॉर्ड किया।${mostActiveDay !== '—' ? ` सबसे सक्रिय दिन ${mostActiveDay} रहा।` : ''}${topCategory ? ` मुख्य जैव विविधता श्रेणी ${topCategory} रही।` : ''}`;
  }

  return enSummary;
};

// Rank calculator based on Eco Score
const getEcoRank = (score) => {
  if (score >= 85) return { title: 'Apex Naturalist', badge: '🌟 S-Tier Guardian', color: '#4ADE80' };
  if (score >= 70) return { title: 'Canopy Guardian', badge: '🌿 High Resonance', color: '#2DD4BF' };
  if (score >= 50) return { title: 'Habitat Explorer', badge: '🧭 Dynamic Tracker', color: '#60A5FA' };
  if (score >= 25) return { title: 'Wilderness Scout', badge: '🌱 Active Seeker', color: '#FBBF24' };
  return { title: 'Seedling Observer', badge: '🌱 Initial Spark', color: '#94A3B8' };
};

/**
 * GET /api/weekly-recap
 * Query params:
 *   - weekOffset (0 for current week, -1 for previous week, -2, etc.)
 *   - startDate (optional ISO string)
 *   - endDate (optional ISO string)
 *   - lang (en, gu, hi)
 */
const getWeeklyRecap = async (req, res) => {
  const userId = req.user._id;
  const lang = req.query.lang || 'en';
  const weekOffset = parseInt(req.query.weekOffset || '0', 10) || 0;

  // Determine window dates
  let start, end;
  if (req.query.startDate && req.query.endDate) {
    start = new Date(req.query.startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(req.query.endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    const now = new Date();
    end = new Date(now);
    end.setDate(end.getDate() + weekOffset * 7);
    end.setHours(23, 59, 59, 999);

    start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }

  const weekId = `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`;
  const weekLabel = formatDateRange(start, end);

  // Previous week window for trends
  const prevEnd = new Date(start);
  prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 6);
  prevStart.setHours(0, 0, 0, 0);

  // Fetch all user records across models in parallel
  const [
    discoveries,
    prevDiscoveries,
    journalEntries,
    missions,
    actions,
    profile,
    chatThreads,
    savedSnapshot,
  ] = await Promise.all([
    Discovery.find({ user: userId, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 }),
    Discovery.find({ user: userId, createdAt: { $gte: prevStart, $lte: prevEnd } }).select('_id common_name'),
    JournalEntry.find({ user: userId, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 }),
    Mission.find({ user: userId, $or: [{ completed_at: { $gte: start, $lte: end } }, { createdAt: { $gte: start, $lte: end } }] }),
    Action.find({ user: userId, createdAt: { $gte: start, $lte: end } }),
    Profile.findOne({ user: userId }),
    ChatThread.find({ user: userId, updatedAt: { $gte: start, $lte: end } }),
    WeeklyRecapSnapshot.findOne({ user: userId, week_id: weekId }),
  ]);

  // Aggregate Discoveries & Species
  const speciesMap = {};
  const categoryCounts = {
    birds: 0,
    trees: 0,
    flowers: 0,
    insects: 0,
    fungi: 0,
    moss: 0,
    mammals: 0,
    reptiles: 0,
    other: 0,
  };
  const placesSet = new Set();

  discoveries.forEach((d) => {
    const cName = d.common_name?.trim() || 'Unknown Species';
    if (!speciesMap[cName]) {
      speciesMap[cName] = {
        name: cName,
        scientific_name: d.scientific_name || '',
        category: d.category || 'other',
        count: 0,
        highest_confidence: d.confidence_pct || 90,
        image_url: d.image_url || '',
        places: new Set(),
        notes: d.notes || d.description || '',
        id: d._id.toString(),
        last_seen: d.createdAt,
      };
    }
    speciesMap[cName].count += 1;
    if ((d.confidence_pct || 0) > speciesMap[cName].highest_confidence) {
      speciesMap[cName].highest_confidence = d.confidence_pct;
    }
    if (d.image_url && !speciesMap[cName].image_url) {
      speciesMap[cName].image_url = d.image_url;
    }
    if (d.place_name) {
      speciesMap[cName].places.add(d.place_name);
      placesSet.add(d.place_name);
    }
    if (d.city) placesSet.add(d.city);

    const cat = d.category && categoryCounts[d.category] !== undefined ? d.category : 'other';
    categoryCounts[cat] += 1;
  });

  const speciesList = Object.values(speciesMap).map((sp) => ({
    ...sp,
    places: Array.from(sp.places),
  })).sort((a, b) => b.count - a.count || b.highest_confidence - a.highest_confidence);

  const totalSpecies = speciesList.length;
  const totalObservations = discoveries.length;
  const topSpecies = speciesList[0] || null;

  // Category Breakdown with Percentages
  const categoriesBreakdown = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([cat, count]) => ({
      category: cat,
      count,
      percentage: totalObservations > 0 ? Math.round((count / totalObservations) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topCategory = categoriesBreakdown[0]?.category || '';

  // 7-Day Daily Nodes Calculation for S-Curve Timeline
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timelineNodes = [];
  const activeDatesSet = new Set();
  const dayCountsMap = {};

  const curDay = new Date(start);
  for (let i = 0; i < 7; i++) {
    const dKey = toDateKey(curDay);
    const dayOfWeek = curDay.getDay();

    const dayDiscoveries = discoveries.filter((d) => toDateKey(d.createdAt) === dKey);
    const dayJournals = journalEntries.filter((d) => toDateKey(d.createdAt) === dKey);
    const dayMissions = missions.filter((m) => toDateKey(m.completed_at || m.createdAt) === dKey);
    const dayActions = actions.filter((a) => toDateKey(a.createdAt) === dKey);

    const obsCount = dayDiscoveries.length;
    const jourCount = dayJournals.length;
    const misCount = dayMissions.length;
    const actCount = dayActions.length;
    const totalActivity = obsCount + jourCount + misCount + actCount;

    if (totalActivity > 0) {
      activeDatesSet.add(dKey);
    }
    dayCountsMap[dKey] = totalActivity;

    // Daily highlight description
    const daySpecies = [...new Set(dayDiscoveries.map((d) => d.common_name).filter(Boolean))];
    let highlight = 'Quiet day in the wild. No observations recorded.';
    if (obsCount > 0) {
      highlight = `Recorded ${obsCount} observation${obsCount === 1 ? '' : 's'}${daySpecies.length ? ' (' + daySpecies.slice(0, 2).join(', ') + ')' : ''}.`;
    } else if (jourCount > 0) {
      highlight = `Wrote ${jourCount} nature reflection${jourCount === 1 ? '' : 's'} in journal.`;
    } else if (misCount > 0 || actCount > 0) {
      highlight = `Completed ${misCount + actCount} field mission${misCount + actCount === 1 ? '' : 's'} / action${misCount + actCount === 1 ? '' : 's'}.`;
    }

    // Top category for this day
    const dayCatMap = {};
    dayDiscoveries.forEach((d) => {
      const c = d.category || 'other';
      dayCatMap[c] = (dayCatMap[c] || 0) + 1;
    });
    const topDayCat = Object.keys(dayCatMap).reduce((a, b) => (dayCatMap[a] >= dayCatMap[b] ? a : b), 'other');

    // Daily items for inspector
    const items = [
      ...dayDiscoveries.map((d) => ({
        type: 'discovery',
        id: d._id.toString(),
        title: d.common_name,
        subtitle: d.scientific_name || d.category,
        category: d.category,
        image_url: d.image_url,
        confidence_pct: d.confidence_pct,
        place: d.place_name || d.city || '',
        time: d.createdAt,
      })),
      ...dayJournals.map((j) => ({
        type: 'journal',
        id: j._id.toString(),
        title: j.title,
        subtitle: `Mood: ${j.mood || 'quiet'}`,
        category: 'journal',
        image_url: j.image_url,
        time: j.createdAt,
      })),
      ...dayMissions.map((m) => ({
        type: 'mission',
        id: m._id.toString(),
        title: m.title,
        subtitle: `Mission: ${m.mission_type}`,
        category: 'mission',
        time: m.completed_at || m.createdAt,
      })),
      ...dayActions.map((a) => ({
        type: 'action',
        id: a._id.toString(),
        title: a.title,
        subtitle: `Action: ${a.category}`,
        category: 'action',
        time: a.createdAt,
      })),
    ];

    timelineNodes.push({
      date: dKey,
      day: dayNames[dayOfWeek],
      fullDay: `${fullDayNames[dayOfWeek]}, ${curDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      dayIndex: i,
      observations: obsCount,
      speciesList: daySpecies,
      journals: jourCount,
      missions: misCount,
      actions: actCount,
      totalActivity,
      intensity: Math.min(100, Math.round(totalActivity * 25)),
      topCategory: obsCount > 0 ? topDayCat : '',
      highlight,
      items,
    });

    curDay.setDate(curDay.getDate() + 1);
  }

  const activeDays = activeDatesSet.size;

  // Most Active Day
  let mostActiveDay = '—';
  let mostActiveCount = 0;
  let mostActiveKey = '';
  Object.entries(dayCountsMap).forEach(([k, count]) => {
    if (count > mostActiveCount) {
      mostActiveCount = count;
      mostActiveKey = k;
    }
  });

  if (mostActiveKey) {
    const mDate = new Date(mostActiveKey);
    mostActiveDay = fullDayNames[mDate.getDay()];
  }

  // Missions & Actions Completed
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const completedActions = actions.filter((a) => a.status === 'done' || a.status === 'completed');

  // Weekly Goals from Profile
  const weeklyGoals = Array.isArray(profile?.weekly_goals) ? profile.weekly_goals : [];
  const goalsTotal = weeklyGoals.length;
  const goalsCompleted = weeklyGoals.filter((g) => g.done).length;
  const goalsPercent = goalsTotal > 0 ? Math.round((goalsCompleted / goalsTotal) * 100) : 0;

  // Real Multi-Factor Composite Eco Score (0 - 100)
  // 1. Consistency: up to 35 pts (Active days / 7)
  const consistencyScore = Math.min(35, (activeDays / 7) * 35);
  // 2. Species Diversity: up to 25 pts (min 8 species = 25 pts)
  const diversityScore = Math.min(25, (totalSpecies / 8) * 25);
  // 3. Habitat Exploration: up to 15 pts (min 4 places = 15 pts)
  const habitatScore = Math.min(15, (placesSet.size / 4) * 15);
  // 4. Conservation & Missions: up to 15 pts (min 4 items = 15 pts)
  const actionScore = Math.min(15, ((completedMissions.length + completedActions.length) / 4) * 15);
  // 5. Mindfulness & Journaling: up to 10 pts (min 3 entries = 10 pts)
  const reflectionScore = Math.min(10, (journalEntries.length / 3) * 10);

  const rawEcoScore = consistencyScore + diversityScore + habitatScore + actionScore + reflectionScore;
  const ecoScore = Math.min(100, Math.max(0, Math.round(rawEcoScore)));
  const ecoRank = getEcoRank(ecoScore);

  // Dynamic AI / Ecological Synthesis
  const summaryText = generateSynthesis({
    totalSpecies,
    totalObs: totalObservations,
    activeDays,
    mostActiveDay,
    topCategory,
    topSpeciesName: topSpecies?.name || '',
    placesCount: placesSet.size,
    goalsCompleted,
    goalsTotal,
  }, lang);

  // Constellation Galaxy Graph Generation
  const constellationNodes = [];
  const constellationLinks = [];

  // Core Center Node
  constellationNodes.push({
    id: 'core-user',
    name: profile?.display_name || 'Cosmic Explorer',
    type: 'core',
    size: 34,
    color: '#4ADE80',
    count: totalObservations,
    desc: 'Central consciousness of your ecological cosmos',
    x: 0,
    y: 0,
  });

  // Category Satellite Hubs
  categoriesBreakdown.forEach((catObj, idx) => {
    const angle = (idx * 2 * Math.PI) / Math.max(1, categoriesBreakdown.length);
    const radius = 130;
    const catId = `cat-${catObj.category}`;
    constellationNodes.push({
      id: catId,
      name: `${catObj.category.charAt(0).toUpperCase() + catObj.category.slice(1)} Hub`,
      category: catObj.category,
      type: 'category',
      size: Math.min(28, 16 + catObj.count * 2),
      color: catObj.category === 'birds' ? '#60A5FA' : catObj.category === 'trees' ? '#34D399' : catObj.category === 'flowers' ? '#F472B6' : catObj.category === 'fungi' ? '#A78BFA' : '#FBBF24',
      count: catObj.count,
      percentage: catObj.percentage,
      desc: `${catObj.count} observation${catObj.count === 1 ? '' : 's'} (${catObj.percentage}% of weekly focus)`,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });

    constellationLinks.push({
      source: 'core-user',
      target: catId,
      value: catObj.count,
      type: 'core-category',
    });
  });

  // Species Nodes linked to Category Hubs
  speciesList.slice(0, 15).forEach((sp, idx) => {
    const catNode = constellationNodes.find((n) => n.category === sp.category && n.type === 'category');
    const baseAngle = catNode ? Math.atan2(catNode.y, catNode.x) : (idx * 2 * Math.PI) / speciesList.length;
    const spread = (idx % 3 - 1) * 0.45;
    const starRadius = 220 + (idx % 2) * 35;

    const spNodeId = `sp-${idx}-${sp.id}`;
    constellationNodes.push({
      id: spNodeId,
      name: sp.name,
      scientific_name: sp.scientific_name,
      category: sp.category,
      type: 'species',
      size: Math.min(22, 12 + sp.count * 3),
      confidence_pct: sp.highest_confidence,
      count: sp.count,
      image_url: sp.image_url,
      places: sp.places,
      notes: sp.notes,
      desc: `${sp.count} observation${sp.count === 1 ? '' : 's'} • ${sp.highest_confidence}% AI confidence`,
      x: Math.cos(baseAngle + spread) * starRadius,
      y: Math.sin(baseAngle + spread) * starRadius,
    });

    if (catNode) {
      constellationLinks.push({
        source: catNode.id,
        target: spNodeId,
        value: sp.count,
        type: 'category-species',
      });
    }
  });

  // Habitats / Places Explored List
  const placesExploredList = Array.from(placesSet);

  // Response Payload
  const responseData = {
    week_id: weekId,
    week_label: weekLabel,
    week_offset: weekOffset,
    start_date: start,
    end_date: end,
    is_saved_in_vault: Boolean(savedSnapshot),
    saved_snapshot_id: savedSnapshot?._id || null,

    // High Level Metrics
    eco_score: ecoScore,
    eco_rank: ecoRank.title,
    eco_badge: ecoRank.badge,
    eco_color: ecoRank.color,
    total_species: totalSpecies,
    total_observations: totalObservations,
    active_days: activeDays,
    most_active_day: mostActiveDay,
    most_active_count: mostActiveCount,

    // Breakdown metrics
    species_list: speciesList,
    top_species: topSpecies,
    categories_breakdown: categoriesBreakdown,
    places_explored: placesExploredList,
    places_count: placesExploredList.length,

    // Secondary Activities
    journal_count: journalEntries.length,
    missions_count: completedMissions.length,
    actions_count: completedActions.length,
    chat_threads_count: chatThreads.length,

    // Weekly Goals
    goals: weeklyGoals,
    goals_total: goalsTotal,
    goals_completed: goalsCompleted,
    goals_percentage: goalsPercent,

    // Synthesis & Narrative
    summary: summaryText,

    // S-Curve Timeline
    timeline: timelineNodes,

    // Constellation Galaxy Graph
    constellation: {
      nodes: constellationNodes,
      links: constellationLinks,
    },

    // Compared to Previous Week Trends
    trends: {
      observations_delta: totalObservations - prevDiscoveries.length,
      species_delta: totalSpecies - new Set(prevDiscoveries.map((d) => d.common_name)).size,
    },
  };

  res.json(responseData);
};

/**
 * GET /api/weekly-recap/snapshots
 * Retrieve all saved recap snapshots for the user
 */
const getRecapSnapshots = async (req, res) => {
  const userId = req.user._id;
  const snapshots = await WeeklyRecapSnapshot.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  res.json(snapshots);
};

/**
 * POST /api/weekly-recap/snapshots
 * Save current or given week recap snapshot into the vault
 */
const createRecapSnapshot = async (req, res) => {
  const userId = req.user._id;
  const { week_id, week_label, start_date, end_date, snapshot_data } = req.body;

  if (!week_id || !week_label) {
    return res.status(400).json({ error: 'Week ID and label are required to save snapshot.' });
  }

  // Check if snapshot already exists for this week
  let snapshot = await WeeklyRecapSnapshot.findOne({ user: userId, week_id });

  const payload = {
    user: userId,
    week_id,
    week_label,
    start_date: start_date ? new Date(start_date) : new Date(),
    end_date: end_date ? new Date(end_date) : new Date(),
    eco_score: snapshot_data?.eco_score || 0,
    eco_rank: snapshot_data?.eco_rank || 'Seedling Scout',
    total_species: snapshot_data?.total_species || 0,
    total_observations: snapshot_data?.total_observations || 0,
    active_days: snapshot_data?.active_days || 0,
    most_active_day: snapshot_data?.most_active_day || '—',
    top_species: snapshot_data?.top_species || null,
    categories: snapshot_data?.categories_breakdown || [],
    places_count: snapshot_data?.places_count || 0,
    missions_count: snapshot_data?.missions_count || 0,
    actions_count: snapshot_data?.actions_count || 0,
    journals_count: snapshot_data?.journal_count || 0,
    summary: snapshot_data?.summary || '',
    snapshot_data: snapshot_data || {},
  };

  if (snapshot) {
    Object.assign(snapshot, payload);
    await snapshot.save();
    return res.json({ message: 'Snapshot updated successfully', snapshot });
  }

  snapshot = await WeeklyRecapSnapshot.create(payload);
  res.status(201).json({ message: 'Snapshot saved to vault successfully', snapshot });
};

/**
 * DELETE /api/weekly-recap/snapshots/:id
 * Delete a snapshot from the vault
 */
const deleteRecapSnapshot = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid snapshot id.' });
  }

  const snapshot = await WeeklyRecapSnapshot.findOne({ _id: id, user: req.user._id });
  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found or not yours.' });
  }

  await snapshot.deleteOne();
  res.json({ success: true, message: 'Snapshot deleted from vault.' });
};

module.exports = {
  getWeeklyRecap,
  getRecapSnapshots,
  createRecapSnapshot,
  deleteRecapSnapshot,
};
