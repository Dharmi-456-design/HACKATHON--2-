async function callGeminiApi({ prompt, system, imageBase64, mimeType, json = false, temperature = 0.5, messages = [] }) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return { unavailable: true, reason: 'missing-key' };
  
  // Available modern Gemini models
  const models = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro'
  ];

  const contents = [];

  // If conversation history is provided, format it
  if (Array.isArray(messages) && messages.length > 0) {
    for (const msg of messages) {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const msgText = typeof msg.content === 'string' ? msg.content.trim() : (typeof msg.text === 'string' ? msg.text.trim() : '');
      if (!msgText && !msg.imageBase64) continue;
      
      const msgParts = [];
      if (msgText) msgParts.push({ text: msgText });
      if (msg.imageBase64) {
        msgParts.push({
          inline_data: {
            mime_type: msg.mimeType || msg.contentType || 'image/jpeg',
            data: msg.imageBase64,
          },
        });
      }
      contents.push({ role, parts: msgParts });
    }
  }

  // If prompt is specified and not already the last item in contents
  if (prompt || imageBase64) {
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
    const lastContent = contents[contents.length - 1];
    if (!lastContent || lastContent.role !== 'user' || lastContent.parts?.[0]?.text !== prompt) {
      contents.push({ role: 'user', parts });
    }
  }

  if (contents.length === 0) {
    return { unavailable: true, reason: 'empty-prompt' };
  }

  // Ensure alternating user/model pattern for Gemini API
  const sanitizedContents = [];
  for (let i = 0; i < contents.length; i++) {
    const curr = contents[i];
    const prev = sanitizedContents[sanitizedContents.length - 1];
    if (!prev) {
      if (curr.role === 'user') {
        sanitizedContents.push(curr);
      }
    } else if (curr.role === prev.role) {
      // Merge consecutive same-role turns
      prev.parts.push(...curr.parts);
    } else {
      sanitizedContents.push(curr);
    }
  }

  // Ensure conversation ends with a user turn
  if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === 'model') {
    sanitizedContents.pop();
  }

  if (sanitizedContents.length === 0) {
    sanitizedContents.push({ role: 'user', parts: [{ text: prompt || 'Hello' }] });
  }

  const body = {
    contents: sanitizedContents,
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
        if (!text) continue;
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
      const errJson = await res.json().catch(() => ({}));
      console.warn(`Model ${model} returned ${res.status}:`, errJson?.error?.message || res.statusText);
    } catch (err) {
      console.warn(`Model ${model} failed, trying next fallback:`, err.message);
    }
  }
  return { unavailable: true };
}

module.exports = { callGeminiApi };
