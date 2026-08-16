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
        .from('np_discoveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const b = sanitizeObject(req.body || {});
      if (!b.common_name && !b.description) {
        return res.status(400).json({ error: 'Add a name or a short description of what you noticed.' });
      }
      const { data, error } = await supabase
        .from('np_discoveries')
        .insert({
          user_id: user.id,
          image_url: b.image_url || '',
          common_name: b.common_name || 'Unnamed observation',
          scientific_name: b.scientific_name || '',
          confidence: b.confidence || 'uncertain',
          category: b.category || 'other',
          description: b.description || '',
          why_it_matters: b.why_it_matters || '',
          experience_suggestion: b.experience_suggestion || '',
          notes: b.notes || '',
          place_name: b.place_name || '',
          city: b.city || '',
          is_public: !!b.is_public,
          raw_analysis: b.raw_analysis || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const b = sanitizeObject(req.body || {});
      if (!b.id) return res.status(400).json({ error: 'Discovery id required' });
      const patch = {};
      ['notes', 'is_public', 'place_name', 'common_name', 'description'].forEach((k) => {
        if (b[k] !== undefined) patch[k] = b[k];
      });
      const { data, error } = await supabase
        .from('np_discoveries')
        .update(patch)
        .eq('id', b.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Discovery id required' });
      const { error } = await supabase.from('np_discoveries').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('discoveries error:', err);
    res.status(500).json({ error: err.message });
  }
}
