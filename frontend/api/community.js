import supabase from './db-client.js';
import { cors } from './lib/gemini.js';
import { sanitizeObject } from './lib/sanitize.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_community')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Sign in to share.' });
      const { data: auth } = await supabase.auth.getUser(token);
      if (!auth?.user) return res.status(401).json({ error: 'Invalid session' });

      const b = sanitizeObject(req.body || {});
      if (!b.common_name) return res.status(400).json({ error: 'What did you notice?' });
      const { data: profile } = await supabase
        .from('np_profiles')
        .select('display_name, city, region')
        .eq('user_id', auth.user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('np_community')
        .insert({
          user_id: auth.user.id,
          display_name: profile?.display_name || 'Neighbor',
          common_name: b.common_name,
          scientific_name: b.scientific_name || '',
          category: b.category || 'other',
          city: profile?.city || b.city || '',
          region: profile?.region || '',
          note: b.note || '',
          image_url: b.image_url || '',
          confidence: b.confidence || 'uncertain',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('community error:', err);
    res.status(500).json({ error: err.message });
  }
}
