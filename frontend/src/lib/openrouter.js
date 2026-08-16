// ─── OpenRouter Chat Service ────────────────────────────────────────────────
// Calls OpenRouter (OpenAI-compatible) to power the Pulse chatbot.
// Model: google/gemini-2.0-flash-001 (fast, capable, free-tier friendly)

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const SYSTEM_PROMPT = `You are "Pulse", the nature guide inside the NaturePulse app.

Personality: Calm, encouraging, intelligent, practical. Never a know-it-all.
You help users reconnect with the natural world around them — in their garden, neighborhood, park, or balcony.

Core behaviors:
- Give short, warm, actionable answers (2-4 sentences typical).
- When a user describes a species or plant, identify it if you can, but acknowledge uncertainty honestly.
- Suggest micro-observations: "Look closer at…", "Spend 2 minutes watching…", "Touch the bark and notice…"
- Weave in ecological context: why a species matters, its role in the local ecosystem.
- If someone says they have limited time, suggest a quick 5-minute nature moment.
- Never lecture. Never guilt. Nature is not homework.
- Use occasional poetic phrasing but stay grounded.
- If asked about something outside nature/ecology, gently redirect: "That's outside my canopy — I'm best with the living world around you."

You may use simple markdown formatting: **bold**, *italic*, and line breaks. No headers or code blocks.`;

/**
 * Send a chat message to OpenRouter and get a streamed or full response.
 * @param {Array<{role: string, content: string}>} messages - conversation history
 * @returns {Promise<string>} assistant reply text
 */
export async function chatWithPulse(messages) {
  if (!API_KEY) {
    throw new Error('OpenRouter API key is not configured. Add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'NaturePulse',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenRouter error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Pulse is quiet right now. Try again.';
}
