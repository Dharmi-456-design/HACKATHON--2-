import supabase from './db-client.js';
import { cors, requireUser } from './lib/gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileBase64 || !fileName) return res.status(400).json({ error: 'A file is required.' });

    const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const path = `${user.id}/${Date.now()}-${safe}`;
    const buffer = Buffer.from(fileBase64, 'base64');

    const { error } = await supabase.storage
      .from('naturepulse')
      .upload(path, buffer, { contentType: contentType || 'image/jpeg', upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('naturepulse').getPublicUrl(path);
    return res.status(200).json({ url: urlData.publicUrl, path });
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
