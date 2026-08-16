import React from 'react';
  
  const Gemini = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Gemini;
  // ─── Gemini Chat Service ───────────────────────────────────────────────────
// Calls Google's Generative Language API directly to power the Pulse chatbot.
// Model: gemini-3.6-flash (fast, capable, free tier friendly)
// Get a free API key: https://aistudio.google.com/apikey

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

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
 * Send a chat message to Gemini and get the assistant reply text.
 * @param {Array<{role: string, content: string}>} messages - conversation history
 * @returns {Promise<string>} assistant reply text
 */
export async function chatWithPulse(messages) {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const contents = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: 'Hello' }] });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('') || 'Pulse is quiet right now. Try again.';
}
