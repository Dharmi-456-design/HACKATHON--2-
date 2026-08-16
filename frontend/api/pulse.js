import supabase from './db-client.js';
import { cors, requireUser, geminiGenerate, PULSE_SYSTEM } from './lib/gemini.js';
import { sanitizeText } from './lib/sanitize.js';

function fallbackReply(content, ctx) {
  const c = (content || '').toLowerCase();
  if (c.includes('mission') || c.includes('today')) {
    return 'Start smaller than you think. Ten honest minutes with one tree, one seam of moss, or the nearest moving water will teach you more than a long unfocused walk. If you already have a mission waiting, take that one. Returning to a suggested place is how a day becomes a relationship.';
  }
  if (c.includes('bird') || c.includes('plant') || c.includes('what is')) {
    return 'I will not invent a name. Tell me what you can actually see or hear — size, color, where it was growing or perched, what the light was doing. Three true details are more useful than a guess. You can also open Nature Lens and I will stay inside what the photograph supports.';
  }
  if (c.includes('help') || c.includes('do') || c.includes('act')) {
    return `In ${ctx.city || 'your city'}, useful care is usually local and unglamorous: litter at a green edge, water at the drip line of a young tree, lights off after ten, leaves left in one quiet corner. Choose a window of time you truly have. Then do only that.`;
  }
  return `I am here to help you notice what is already around you — not to turn the living world into a quiz. ${ctx.city ? ctx.city + ' is full of ordinary habitats that repay attention.' : 'Wherever you are, start with the nearest green edge.'} Tell me how much time you have, or what you just saw, and I will give you one calm next step.`;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('np_pulse')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(80);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const content = sanitizeText(String(req.body?.content || '').trim(), 2000);
      const imageBase64 = req.body?.imageBase64 ? String(req.body.imageBase64) : '';
      const contentType = String(req.body?.contentType || '');
      const language = String(req.body?.language || 'en');

      const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (imageBase64) {
        if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
          return res.status(400).json({ error: 'Only jpeg, png, gif or webp images are supported.' });
        }
        if (imageBase64.length > 5 * 1024 * 1024) {
          return res.status(400).json({ error: 'Image is too large (max 5 MB).' });
        }
      }
      if (!content && !imageBase64) return res.status(400).json({ error: 'Say something to Pulse.' });

      const userText = content || (imageBase64 ? '[Attached Image Observation]' : '');
      await supabase.from('np_pulse').insert({ user_id: user.id, role: 'user', content: userText, created_at: new Date().toISOString() });

      const [{ data: profile }, { data: discoveries }, { data: missions }, { data: history }] = await Promise.all([
        supabase.from('np_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('np_discoveries').select('common_name, category, confidence').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
        supabase.from('np_missions').select('title, status, mission_type').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
        supabase.from('np_pulse').select('role, content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
      ]);

      const ctx = {
        city: profile?.city || '',
        interests: profile?.interests || [],
        minutes: profile?.available_minutes || 20,
      };

      let reply = imageBase64 ? fallbackReply(content || 'photo', ctx) : fallbackReply(content, ctx);
      const transcript = (history || [])
        .reverse()
        .map((m) => `${m.role === 'user' ? 'Human' : 'Pulse'}: ${m.content}`)
        .join('\n');

      const imageNote = imageBase64
        ? '\nThe user attached a photograph of their surroundings. Look at it carefully and answer their question or describe what is honestly visible — colors, shapes, habitat cues, likely living things — without inventing species names or locations.\n'
        : '';

      const ai = await geminiGenerate({
        temperature: 0.55,
        system: PULSE_SYSTEM,
        prompt: `Context (private, do not recite as a list unless useful):
City: ${ctx.city || 'unknown'} | Time available: ${ctx.minutes}m | Interests: ${ctx.interests.join(', ') || 'none yet'}
Recent discoveries: ${JSON.stringify(discoveries || [])}
Missions: ${JSON.stringify(missions || [])}

Recent conversation:
${transcript}
${imageNote}
Human: ${content}

Reply as Pulse.`,
        imageBase64: imageBase64 || undefined,
        mimeType: contentType,
      });
      if (!ai.unavailable && ai.text) reply = ai.text;

      const { data, error } = await supabase
        .from('np_pulse')
        .insert({ user_id: user.id, role: 'pulse', content: reply, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('np_pulse').delete().eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('pulse error:', err);
    res.status(500).json({ error: err.message });
  }
}
