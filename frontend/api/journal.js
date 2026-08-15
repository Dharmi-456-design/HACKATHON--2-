import supabase from './db-client.js';
import { cors, requireUser } from './lib/gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.body || !String(b.body).trim()) {
        return res.status(400).json({ error: 'Write a few sentences about what you noticed.' });
      }
      const { data, error } = await supabase
        .from('np_journal')
        .insert({
          user_id: user.id,
          title: b.title || 'Field note',
          body: b.body.trim(),
          mood: b.mood || '',
          weather: b.weather || '',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: 'Entry id required' });
      const { data, error } = await supabase
        .from('np_journal')
        .update({
          title: b.title,
          body: b.body,
          mood: b.mood,
          weather: b.weather,
        })
        .eq('id', b.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Entry id required' });
      const { error } = await supabase.from('np_journal').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('journal error:', err);
    res.status(500).json({ error: err.message });
  }
}
