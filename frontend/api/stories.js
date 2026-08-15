import supabase from './db-client.js';
import { cors, requireUser, geminiGenerate, PULSE_SYSTEM } from './lib/gemini.js';

function fallbackStory(discoveries) {
  const names = discoveries.map((d) => d.common_name).filter(Boolean);
  const places = [...new Set(discoveries.map((d) => d.place_name || d.city).filter(Boolean))];
  const title = names.length ? `A thread through ${names.slice(0, 2).join(' and ')}` : 'What the week was holding';
  const list = names.length
    ? names.map((n) => n).join(', ')
    : 'a handful of unnamed moments';
  const where = places.length ? ` around ${places.join(', ')}` : '';
  const narrative = `You did not collect trophies. You collected attention.\n\nIn the last stretch of looking${where}, these things stood in the same weather as you: ${list}. They may not share a food web in a textbook way, and it would be dishonest to force that. What they do share is a place, a season, and a person who stopped.\n\nThat is the beginning of an ecological story — not a closed explanation, but a set of neighbors. If you return to even one of these, you will notice the next layer: who eats, who shelters, who waits for rain.\n\nPulse\'s invitation is simple. Do not rush to complete the picture. Walk the same route once more and see which of these is still there, and who has arrived beside it.`;
  return { title, narrative };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { data: discoveries, error: dErr } = await supabase
        .from('np_discoveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);
      if (dErr) throw dErr;
      if (!discoveries || discoveries.length < 2) {
        return res.status(400).json({ error: 'Save at least two observations before weaving a story.' });
      }

      const { data: profile } = await supabase.from('np_profiles').select('city, region').eq('user_id', user.id).maybeSingle();
      let story = fallbackStory(discoveries);

      const ai = await geminiGenerate({
        json: true,
        temperature: 0.7,
        system: PULSE_SYSTEM,
        prompt: `Weave these field observations into one ecological story. Only connect what is plausible. If a link is uncertain, say so.
City/region: ${profile?.city || ''} ${profile?.region || ''}.
Observations: ${JSON.stringify(discoveries.map((d) => ({
          common_name: d.common_name,
          scientific_name: d.scientific_name,
          category: d.category,
          confidence: d.confidence,
          description: d.description,
          why_it_matters: d.why_it_matters,
          place_name: d.place_name,
        })))}
Return JSON: { "title": string, "narrative": string (400-700 words, lyrical but accurate, second person) }
Do not invent species that were not observed. Do not claim they were seen together if they were not.`,
      });

      if (!ai.unavailable && ai.data?.title && ai.data?.narrative) {
        story = { title: ai.data.title, narrative: ai.data.narrative };
      }

      const { data, error } = await supabase
        .from('np_stories')
        .insert({
          user_id: user.id,
          title: story.title,
          narrative: story.narrative,
          discovery_ids: discoveries.map((d) => d.id),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Story id required' });
      const { error } = await supabase.from('np_stories').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('stories error:', err);
    res.status(500).json({ error: err.message });
  }
}
