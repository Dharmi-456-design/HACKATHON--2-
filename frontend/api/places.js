import supabase from './db-client.js';
import { cors } from './lib/gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const type = req.query?.type;
      let q = supabase.from('np_places').select('*').order('name', { ascending: true });
      if (type && type !== 'all') q = q.eq('type', type);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('places error:', err);
    res.status(500).json({ error: err.message });
  }
}
