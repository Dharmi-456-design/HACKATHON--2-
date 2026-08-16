// ─── Pulse AI Chat Service ──────────────────────────────────────────────────
// Calls OpenRouter (OpenAI-compatible) to power the Pulse chatbot.
// Uses free-tier models with auto-routing fallback.
// Get an API key: https://openrouter.ai/settings/keys

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Priority order: auto-routed free model first, then specific free models.
const CANDIDATE_MODELS = [
  'openrouter/free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'liquid/lfm-2.5-2.6b:free',
];

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
 * Send a chat message to OpenRouter and get the assistant reply text.
 * @param {Array<{role: string, content: string}>} messages - conversation history
 * @returns {Promise<string>} assistant reply text
 */
export async function chatWithPulse(messages) {
  if (!API_KEY) {
    throw new Error('API key is not configured. Add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
          'X-Title': 'NaturePulse',
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let rawContent = data.choices?.[0]?.message?.content || '';

        // Strip reasoning/scratchpad if the model outputs thinking tags
        rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        if (rawContent.startsWith("Here's a thinking process:")) {
          const parts = rawContent.split(/\n\s*\n/);
          rawContent = parts[parts.length - 1] || rawContent;
        }

        if (rawContent) return rawContent;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson?.error?.message || `HTTP ${res.status}`;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastError || 'Pulse is quiet right now. Please try again in a moment.');
}
