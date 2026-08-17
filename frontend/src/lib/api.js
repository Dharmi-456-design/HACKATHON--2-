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
    throw new Error('Cannot reach the NaturePulse server. Please try again.');
  }

  const data = await res.json().catch(() => ({}));

  if (res.ok) return data;

  if (res.status === 401 && !path.startsWith('/auth/') && !path.startsWith('/api/auth/')) {
    if (authToken && !authToken.startsWith('demo-')) {
      clearToken();
    }
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

// Upload a base64-encoded image to the backend as multipart/form-data
// (field "image"). The backend stores it on Cloudinary and returns { url }.
export async function uploadImage({ base64, mime = 'image/jpeg', fileName = 'observation.jpg', token = null }) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const file = new File([bytes], fileName, { type: mime });
  const fd = new FormData();
  fd.append('image', file);
  return apiFetch('/api/upload', { method: 'POST', body: fd }, token);
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
