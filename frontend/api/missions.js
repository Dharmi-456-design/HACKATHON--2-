import supabase from './db-client.js';
import { cors, requireUser, geminiGenerate, PULSE_SYSTEM } from './lib/gemini.js';
import { sanitizeObject } from './lib/sanitize.js';

const FALLBACK_MISSIONS = [
  {
    title: 'Stand still under one tree',
    description: 'Choose a single tree you can reach in a short walk. Stand beneath it for three quiet minutes. Notice bark, light, sound, and anything living on or around it.',
    mission_type: 'observe',
    duration_minutes: 10,
    location_hint: 'Any street tree, courtyard tree, or park edge',
    why_it_matters: 'A relationship with nature begins with attention, not mileage. One tree is a complete habitat.',
    experience_prompt: 'Rest a hand on the trunk. Then look up and count how many different textures you can see.',
  },
  {
    title: 'Follow water, even a little',
    description: 'Find the nearest moving water — a river path, a storm channel after rain, a fountain basin with algae, or dew on leaves. Watch how it moves and what uses it.',
    mission_type: 'explore',
    duration_minutes: 20,
    location_hint: 'Riverfront, creek, puddle, or irrigated garden',
    why_it_matters: 'Water organizes almost every habitat in a city. Following it reveals corridors animals already use.',
    experience_prompt: 'Trace the water with your eyes for one full minute without looking at your phone.',
  },
  {
    title: 'Name what you do not know',
    description: 'Find one plant, bird, or fungus you cannot identify. Do not force a name. Write three visible facts and one honest question.',
    mission_type: 'learn',
    duration_minutes: 15,
    location_hint: 'A block you already walk',
    why_it_matters: 'Uncertainty is part of ecological literacy. NaturePulse never invents a name to feel finished.',
    experience_prompt: 'Sketch or photograph the details that would help a careful naturalist later.',
  },
  {
    title: 'Leave a place slightly better',
    description: 'Spend a short window picking up litter in a green edge, or simply moving a fallen branch off a path so roots and soil stay intact.',
    mission_type: 'act',
    duration_minutes: 15,
    location_hint: 'Park edge, trailhead, or your own stoop garden',
    why_it_matters: 'Care is a practice, not a performance. Small, local actions keep a relationship honest.',
    experience_prompt: 'Before you leave, pause and notice whether the place feels any different to you.',
  },
  {
    title: 'Return to yesterday\'s place',
    description: 'Go back to a spot you already noticed. Compare light, sound, moisture, and who is present. Relationships are built by returning.',
    mission_type: 'return',
    duration_minutes: 12,
    location_hint: 'A place from a previous walk or photo',
    why_it_matters: 'A single visit is a snapshot. Returning is how a landscape becomes familiar, and how you become part of it.',
    experience_prompt: 'Ask: what changed, and what stayed? Write one sentence.',
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_missions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const body = sanitizeObject(req.body || {});

      if (body.generate) {
        const [{ data: profile }, { data: discoveries }, { data: places }, { data: existing }] = await Promise.all([
          supabase.from('np_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('np_discoveries').select('common_name, category, place_name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
          supabase.from('np_places').select('name, type, habitat, city').limit(12),
          supabase.from('np_missions').select('id').eq('user_id', user.id).eq('scheduled_date', todayISO()),
        ]);

        if (existing && existing.length >= 3 && !body.force) {
          const { data: all } = await supabase.from('np_missions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          return res.status(200).json(all || []);
        }

        const minutes = Math.min(480, Math.max(5, Number(body.minutes || profile?.available_minutes || 20)));
        const city = profile?.city || 'Portland';
        const interests = profile?.interests || [];
        let generated = [];

        const ai = await geminiGenerate({
          json: true,
          temperature: 0.6,
          system: PULSE_SYSTEM,
          prompt: `Create 3 personalized daily nature missions for a person in ${city}${profile?.region ? ', ' + profile.region : ''}.
Available time today: about ${minutes} minutes total, so each mission should be doable in ${Math.max(8, Math.round(minutes / 2))} minutes or less.
Interests: ${interests.join(', ') || 'general urban nature'}.
Recent discoveries: ${JSON.stringify(discoveries || [])}.
Nearby named green spaces (use only as optional hints, do not invent access details): ${JSON.stringify(places || [])}.
Missions must require real-world interaction, not screen tasks.
Return JSON: { "missions": [{ "title", "description", "mission_type" (observe|explore|learn|act|return), "duration_minutes", "location_hint", "why_it_matters", "experience_prompt" }] }
Do not invent rare species or unsafe instructions. Keep location hints at neighborhood / habitat scale.`,
        });

        if (!ai.unavailable && ai.data?.missions?.length) {
          generated = ai.data.missions.slice(0, 3);
        } else {
          const shuffled = [...FALLBACK_MISSIONS].sort(() => 0.5 - Math.random());
          generated = shuffled.slice(0, 3).map((m) => ({
            ...m,
            duration_minutes: Math.min(m.duration_minutes, minutes),
            location_hint: city ? `${m.location_hint} · ${city}` : m.location_hint,
          }));
        }

        const rows = generated.map((m) => ({
          user_id: user.id,
          title: m.title,
          description: m.description,
          mission_type: m.mission_type || 'observe',
          duration_minutes: Number(m.duration_minutes) || 15,
          location_hint: m.location_hint || city,
          status: 'suggested',
          why_it_matters: m.why_it_matters || '',
          experience_prompt: m.experience_prompt || '',
          scheduled_date: todayISO(),
          created_at: new Date().toISOString(),
        }));

        const { error: insErr } = await supabase.from('np_missions').insert(rows);
        if (insErr) throw insErr;
        const { data: all, error } = await supabase.from('np_missions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(201).json(all || []);
      }

      const { data, error } = await supabase
        .from('np_missions')
        .insert({
          user_id: user.id,
          title: body.title,
          description: body.description || '',
          mission_type: body.mission_type || 'observe',
          duration_minutes: Number(body.duration_minutes) || 15,
          location_hint: body.location_hint || '',
          status: 'suggested',
          why_it_matters: body.why_it_matters || '',
          experience_prompt: body.experience_prompt || '',
          scheduled_date: body.scheduled_date || todayISO(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Mission id required' });
      const patch = { status };
      if (status === 'completed') patch.completed_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('np_missions')
        .update(patch)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Mission id required' });
      const { error } = await supabase.from('np_missions').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('missions error:', err);
    res.status(500).json({ error: err.message });
  }
}
