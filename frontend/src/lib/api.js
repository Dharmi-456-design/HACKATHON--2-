const TOKEN_KEY = 'np_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://naturpulse.onrender.com')).replace(/\/+$/, '');

export async function apiFetch(path, options = {}, token = null) {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured. Set it to your backend URL.');
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${apiUrl}${cleanPath}`;
  const authToken = token || getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    console.warn(`[apiFetch] Server request to ${url} failed or warming up:`, err.message);
    return { failed: true, data: [], items: [], success: false };
  }

  const data = await res.json().catch(() => ({}));

  if (res.ok) return data;

  // Silently handle 401 — clear token and return graceful response
  if (res.status === 401) {
    clearToken();
    return { failed: true, data: [], items: [], success: false };
  }

  if (data?.message || data?.error) {
    const err = new Error(data.message || data.error);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  const err = new Error(`Request failed (${res.status})`);
  err.status = res.status;
  err.data = data;
  throw err;
}

// Upload an image (base64 or file) to backend -> Cloudinary and returns { url }
export async function uploadImage({ base64, mime = 'image/jpeg', fileName = 'observation.jpg', token = null }) {
  if (!base64) return { url: '' };

  const dataUri = base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`;

  // 1. Try direct base64 upload to Cloudinary endpoint
  try {
    const res = await apiFetch(
      '/api/upload/base64',
      {
        method: 'POST',
        body: JSON.stringify({ base64: dataUri, mime, fileName }),
      },
      token
    );
    if (res && res.url) return res;
  } catch (err) {
    console.warn('Base64 upload attempt notice:', err.message);
  }

  // 2. Try multipart FormData upload to /api/upload
  try {
    const rawB64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const binary = atob(rawB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const file = new File([bytes], fileName, { type: mime });
    const fd = new FormData();
    fd.append('image', file);
    const res = await apiFetch('/api/upload', { method: 'POST', body: fd }, token);
    if (res && res.url) return res;
  } catch (err) {
    console.warn('FormData upload attempt notice:', err.message);
  }

  // Fallback: return client data URI if server upload fails
  return { url: dataUri, success: true };
}

export function fileToResizedBase64(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read image'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mime, 0.86);
      URL.revokeObjectURL(url);
      resolve({ base64: dataUrl.split(',')[1], mime, name: file.name || 'observation.jpg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load that image'));
    };
    img.src = url;
  });
}

export const INTERESTS = [
  'birds',
  'trees & bark',
  'moss & fungi',
  'rivers & rain',
  'urban wild',
  'night sky',
  'soil & insects',
  'seasonal change',
  'quiet sitting',
  'wildflowers',
];

export function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
