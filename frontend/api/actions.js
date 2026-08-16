import supabase from './db-client.js';
import { cors, requireUser, geminiGenerate, PULSE_SYSTEM } from './lib/gemini.js';
import { sanitizeObject } from './lib/sanitize.js';

const FALLBACK_ACTIONS = [
  { title: 'Pick up ten pieces of trail litter', description: 'Walk a familiar green edge and collect what does not belong. Leave soil and living material undisturbed.', category: 'habitat', minutes: 10, impact_note: 'Keeps plastics and metals out of soil and water that birds and insects already use.' },
  { title: 'Water a street tree at its base', description: 'If local rules and weather allow, slowly soak the soil at the drip line of a young street tree — not the trunk, and not the sidewalk.', category: 'water', minutes: 8, impact_note: 'Young urban trees fail most often from drought stress in compacted soil.' },
  { title: 'Leave a leaf-litter corner', description: 'Choose one unobtrusive corner of a yard, planter, or community bed and leave fallen leaves in place.', category: 'soil', minutes: 5, impact_note: 'Leaf litter is winter housing for insects that later feed nestlings.' },
  { title: 'Turn a porch light off after 10', description: 'Reduce overnight light on one outdoor fixture during bird and insect movement seasons.', category: 'wildlife', minutes: 2, impact_note: 'Artificial night light disorients migrating birds and nocturnal insects.' },
  { title: 'Share a precise, humble observation', description: 'Tell one neighbor or friend one true thing you noticed — a bird call, a blooming shrub, a wet-season seep — without overstating it.', category: 'community', minutes: 5, impact_note: 'Attention spreads. Local knowledge is how neighborhoods start to care for a place.' },
  { title: 'Skip a pesticide impulse', description: 'If you were about to treat aphids, moss, or lawn weeds, wait one week and watch who arrives to eat them.', category: 'habitat', minutes: 15, impact_note: 'Many “pests” are food. Holding back chemicals protects the next trophic step.' },
  { title: 'Sit with a neglected patch', description: 'Spend ten quiet minutes in a weedy lot edge, drainage swale, or forgotten planter. Notice what is already working.', category: 'community', minutes: 10, impact_note: 'Care starts with regarding overlooked land as habitat, not emptiness.' },
  { title: 'Refill a shallow bird bath', description: 'Refresh clean, shallow water and add a stone perch. Change it often to avoid mosquitoes.', category: 'wildlife', minutes: 6, impact_note: 'In dry stretches, reliable water can matter more than feeders.' },
];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const body = sanitizeObject(req.body || {});

      if (body.generate) {
        const minutes = Math.min(480, Math.max(5, Number(body.minutes) || 15));
        const [{ data: profile }, { data: discoveries }] = await Promise.all([
          supabase.from('np_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('np_discoveries').select('common_name, category, city').eq('user_id', user.id).limit(6),
        ]);
        const city = profile?.city || 'your city';
        let generated = [];
        const ai = await geminiGenerate({
          json: true,
          temperature: 0.55,
          system: PULSE_SYSTEM,
          prompt: `Generate 4 realistic environmental actions for someone in ${city} who has about ${minutes} minutes right now.
Interests: ${(profile?.interests || []).join(', ') || 'urban nature'}.
Recent observations: ${JSON.stringify(discoveries || [])}.
Actions must be legal, local, modest, and doable today. No donations, no petitions, no travel.
Return JSON: { "actions": [{ "title", "description", "category" (habitat|waste|water|community|wildlife|soil), "minutes", "impact_note" }] }
Do not overclaim impact. Be honest about scale.`,
        });
        if (!ai.unavailable && ai.data?.actions?.length) {
          generated = ai.data.actions.slice(0, 4);
        } else {
          generated = [...FALLBACK_ACTIONS]
            .filter((a) => a.minutes <= minutes + 5)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          if (!generated.length) generated = FALLBACK_ACTIONS.slice(0, 4);
        }
        const rows = generated.map((a) => ({
          user_id: user.id,
          title: a.title,
          description: a.description,
          category: a.category || 'habitat',
          minutes: Number(a.minutes) || minutes,
          impact_note: a.impact_note || '',
          status: 'suggested',
          created_at: new Date().toISOString(),
        }));
        const { error: insErr } = await supabase.from('np_actions').insert(rows);
        if (insErr) throw insErr;
        const { data, error } = await supabase.from('np_actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(201).json(data || []);
      }

      const { data, error } = await supabase
        .from('np_actions')
        .insert({
          user_id: user.id,
          title: body.title,
          description: body.description || '',
          category: body.category || 'habitat',
          minutes: Number(body.minutes) || 10,
          impact_note: body.impact_note || '',
          status: 'suggested',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Action id required' });
      const patch = { status };
      if (status === 'completed') patch.completed_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('np_actions')
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
      if (!id) return res.status(400).json({ error: 'Action id required' });
      const { error } = await supabase.from('np_actions').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('actions error:', err);
    res.status(500).json({ error: err.message });
  }
}
