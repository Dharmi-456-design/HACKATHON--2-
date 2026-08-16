// Lightweight XSS sanitizer for user-supplied free text in Vercel functions.
// Strips HTML/script markup and control characters instead of HTML-escaping,
// so stored text renders literally in React/JSX (which auto-escapes on output).

export function sanitizeText(value, maxLen = 5000) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<[^>]*>/g, ' ');
  s = s.replace(/[<>]/g, '');
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function sanitizeUrl(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

// Sanitize every string/array field of a request body in one pass.
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      out[k] = sanitizeText(v, 5000);
    } else if (Array.isArray(v)) {
      out[k] = v.map((i) => (typeof i === 'string' ? sanitizeText(i, 500) : i)).slice(0, 50);
    } else {
      out[k] = v;
    }
  }
  return out;
}
