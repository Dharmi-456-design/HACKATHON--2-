import supabase from './db-client.js';
import { cors, requireUser, geminiGenerate, PULSE_SYSTEM } from './lib/gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const user = await requireUser(req, res, supabase);
    if (!user) return;

    const { imageBase64, contentType, city, note } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'A photograph is required.' });

    const { data: profile } = await supabase.from('np_profiles').select('city, region, interests').eq('user_id', user.id).maybeSingle();
    const place = city || profile?.city || '';

    const ai = await geminiGenerate({
      json: true,
      temperature: 0.25,
      imageBase64,
      mimeType: contentType || 'image/jpeg',
      system: PULSE_SYSTEM,
      prompt: `Analyze this outdoor photograph for Nature Lens.
The photographer is in or near: ${place || 'an unspecified city'}. Interests: ${(profile?.interests || []).join(', ') || 'general'}.
User note: ${note || 'none'}.

Return ONLY JSON with this shape:
{
  "identified": boolean,
  "confidence": "high" | "medium" | "low" | "uncertain",
  "common_name": string | null,
  "scientific_name": string | null,
  "category": "plant" | "bird" | "insect" | "fungi" | "mammal" | "habitat" | "water" | "other",
  "visible_features": string[],
  "description": string,
  "why_it_matters": string,
  "experience_suggestion": string,
  "ecological_role": string,
  "uncertainty_note": string | null
}

Rules:
- If you cannot reasonably identify a species, set identified=false, confidence="uncertain", common_name=null, scientific_name=null.
- Describe only what is visible. Do not invent range, rarity, edibility, or toxicity.
- why_it_matters should be one grounded paragraph about ecological or human relationship, without exaggeration.
- experience_suggestion must be a real-world next step (look closer, return at another hour, listen, sit, compare a neighbor plant).
- Prefer honesty over completeness.`,
    });

    if (ai.unavailable) {
      return res.status(200).json({
        identified: false,
        confidence: 'uncertain',
        common_name: null,
        scientific_name: null,
        category: 'other',
        visible_features: [],
        description: 'Pulse cannot read this photograph until a Gemini API key is configured for NaturePulse. You can still save what you noticed in your own words — that is a valid observation.',
        why_it_matters: 'A relationship with nature does not require an instant name. Recording what you truly saw keeps the record honest.',
        experience_suggestion: 'Write three visible facts and return to this spot once more this week.',
        ecological_role: '',
        uncertainty_note: 'Image understanding is unavailable in this environment.',
        ai_available: false,
      });
    }

    if (!ai.data) {
      return res.status(200).json({
        identified: false,
        confidence: 'uncertain',
        common_name: null,
        scientific_name: null,
        category: 'other',
        visible_features: [],
        description: 'Pulse could not produce a reliable reading of this image.',
        why_it_matters: 'When the reading is unclear, the honest move is to stay with what you observed.',
        experience_suggestion: 'Save the photo with your own notes and look again in different light.',
        ecological_role: '',
        uncertainty_note: 'The model response was not structured cleanly.',
        ai_available: true,
      });
    }

    return res.status(200).json({ ...ai.data, ai_available: true });
  } catch (err) {
    console.error('analyze error:', err);
    res.status(500).json({ error: err.message });
  }
}
