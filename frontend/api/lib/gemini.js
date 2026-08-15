export const GEMINI_MODEL = 'gemini-2.0-flash';

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export async function requireUser(req, res, supabase) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return null;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: 'Your session expired. Please sign in again.' });
    return null;
  }
  return data.user;
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('').trim();
}

export async function geminiGenerate({ prompt, system, imageBase64, mimeType, json = false, temperature = 0.5 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { unavailable: true };

  const parts = [];
  if (prompt) parts.push({ text: prompt });
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }
  if (json) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 280)}`);
  }

  const data = await res.json();
  const text = extractText(data);
  if (json) {
    try {
      return { data: JSON.parse(text), raw: text };
    } catch {
      return { data: null, raw: text, parseError: true };
    }
  }
  return { text };
}

export const PULSE_SYSTEM = `You are Pulse, the guide inside NaturePulse, an AI-powered Nature Relationship Platform.
Your purpose is to help people notice, understand, experience, and care for the living world already around them.
Voice: calm, encouraging, intelligent, practical. Never preachy, never cute, never corporate.
Speak in short grounded paragraphs. Prefer specific sensory cues over slogans.
Never invent a species identification, toxicity claim, rarity status, or exact location.
If you are unsure, say so and describe only what is knowable.
Never ask for or repeat precise coordinates or street addresses. City and habitat type are enough.
Guide people through Observe → Understand → Experience → Act → Measure → Return.
Offer one clear next step when useful. Keep replies under 180 words unless the user asks for more.`;
