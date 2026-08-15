import supabase from './db-client.js';
import { cors, requireUser } from './lib/gemini.js';

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function uniqueDays(rows) {
  const set = new Set((rows || []).map((r) => (r.created_at || r.completed_at || '').slice(0, 10)).filter(Boolean));
  return set.size;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    const [{ data: discoveries }, { data: missions }, { data: actions }, { data: journal }, { data: stories }] =
      await Promise.all([
        supabase.from('np_discoveries').select('id, created_at').eq('user_id', user.id),
        supabase.from('np_missions').select('id, mission_type, status, completed_at, created_at').eq('user_id', user.id),
        supabase.from('np_actions').select('id, status, completed_at, created_at').eq('user_id', user.id),
        supabase.from('np_journal').select('id, created_at').eq('user_id', user.id),
        supabase.from('np_stories').select('id, created_at').eq('user_id', user.id),
      ]);

    const completedM = (missions || []).filter((m) => m.status === 'completed');
    const completedA = (actions || []).filter((a) => a.status === 'completed');
    const byType = (t) => completedM.filter((m) => m.mission_type === t).length;
    const days = uniqueDays([...(discoveries || []), ...completedM, ...(journal || [])]);
    const hasLife =
      (discoveries || []).length + completedM.length + completedA.length + (journal || []).length + (stories || []).length > 0;
    const base = hasLife ? 48 : 8;

    const observe = clamp(base + (discoveries || []).length * 5 + byType('observe') * 6);
    const explore = clamp(base + byType('explore') * 8 + (discoveries || []).length * 2);
    const learn = clamp(base + (journal || []).length * 6 + (stories || []).length * 8 + byType('learn') * 6);
    const act = clamp(base + completedA.length * 8 + byType('act') * 6);
    const returnDim = clamp(base + days * 5 + byType('return') * 10);
    const weighted = observe * 0.26 + explore * 0.16 + learn * 0.16 + act * 0.16 + returnDim * 0.26;
    const overall = clamp(weighted + (days >= 3 ? 6 : 0));

    const score = {
      user_id: user.id,
      observe,
      explore,
      learn,
      act,
      return_dim: returnDim,
      overall,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase.from('np_scores').select('id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      await supabase.from('np_scores').update(score).eq('user_id', user.id);
    } else {
      await supabase.from('np_scores').insert(score);
    }

    return res.status(200).json(score);
  } catch (err) {
    console.error('connection error:', err);
    res.status(500).json({ error: err.message });
  }
}
