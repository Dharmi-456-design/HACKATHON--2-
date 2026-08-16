import supabase from './db-client.js';
import { cors, requireUser } from './lib/gemini.js';
import { sanitizeObject } from './lib/sanitize.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json(data || {
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend',
        city: '',
        region: '',
        interests: [],
        available_minutes: 20,
        bio: '',
        onboarding_complete: false,
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = sanitizeObject(req.body || {});
      const minutes = Math.min(480, Math.max(1, Number(body.available_minutes) || 20));
      const payload = {
        user_id: user.id,
        display_name: body.display_name || user.email?.split('@')[0] || 'Friend',
        city: body.city || '',
        region: body.region || '',
        interests: Array.isArray(body.interests) ? body.interests.slice(0, 20) : [],
        available_minutes: minutes,
        bio: body.bio || '',
        onboarding_complete: body.onboarding_complete !== false,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('np_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('np_profiles')
          .update(payload)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('np_profiles')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json(result);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('profile error:', err);
    res.status(500).json({ error: err.message });
  }
}
