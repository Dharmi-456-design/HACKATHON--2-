// Lightweight XSS sanitizer for user-supplied free text.
// Strips HTML/script markup and control characters instead of HTML-escaping,
// so stored text renders literally in React/JSX (which auto-escapes on output).
const sanitizeText = (value, maxLen = 2000) => {
  if (value === null || value === undefined) return '';
  let s = String(value);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<[^>]*>/g, ' ');
  s = s.replace(/[<>]/g, '');
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
  return s;
};

const sanitizeUrl = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
};

// Same XSS stripping as sanitizeText but preserves paragraph breaks (\n)
// for long-form content such as journal entries and story narratives.
const sanitizeMultiline = (value, maxLen = 20000) => {
  if (value === null || value === undefined) return '';
  let s = String(value);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<[^>]*>/g, ' ');
  s = s.replace(/[<>]/g, '');
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = s.replace(/[ \t]+/g, ' ').trim();
  if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
  return s;
};

module.exports = { sanitizeText, sanitizeUrl, sanitizeMultiline };
