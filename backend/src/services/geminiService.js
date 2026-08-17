async function callGeminiApi({ prompt, system, imageBase64, mimeType, json = false, temperature = 0.5 }) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return { unavailable: true, reason: 'missing-key' };
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];

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

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
        if (json) {
          try {
            const cleaned = text
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```$/, '')
              .trim();
            return { data: JSON.parse(cleaned), raw: text };
          } catch {
            return { data: null, raw: text, parseError: true };
          }
        }
        return { text };
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message);
    }
  }
  return { unavailable: true };
}

module.exports = { callGeminiApi };
