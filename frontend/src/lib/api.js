import { isDemoMode, DEMO_SPECIES } from '../utils/demoMode';

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

// ── Demo mode mock state (ONLY used when demo mode is explicitly enabled) ────
let mockProfile = {
  display_name: 'Demo Explorer',
  city: 'Portland',
  region: 'Oregon',
  available_minutes: 20,
  interests: ['urban wild', 'trees & bark'],
  onboarding_complete: true,
};

let mockDiscoveries = DEMO_SPECIES.map((s, idx) => ({
  id: `demo-disc-${idx + 1}`,
  common_name: s.common_name,
  scientific_name: s.scientific_name,
  confidence: s.confidence,
  confidence_pct: s.confidence_pct,
  category: s.category,
  description: s.description,
  why_it_matters: s.why_it_matters,
  experience_suggestion: s.experience_suggestion,
  place_name: 'Forest Park edge',
  city: 'Portland',
  created_at: new Date(Date.now() - idx * 86400000).toISOString(),
  is_public: true,
}));

let mockMissions = [
  {
    id: 'm1',
    title: 'Listen to tree canopy at dawn',
    description: 'Stand under the largest tree in your neighborhood for 5 minutes without looking at your phone.',
    mission_type: 'observe',
    duration_minutes: 10,
    status: 'scheduled',
    location_hint: 'Any nearby tree',
    why_it_matters: 'Slowing down helps tune your sensory system to ambient nature sounds.',
    scheduled_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'm2',
    title: 'Find 3 distinct moss textures',
    description: 'Touch 3 different patches of moss on trees, walls, or ground. Notice moisture and thickness differences.',
    mission_type: 'explore',
    duration_minutes: 15,
    status: 'scheduled',
    location_hint: 'Shaded wall or tree base',
    why_it_matters: 'Mosses act as micro-ecosystem sponges, filtering urban rainwater.',
    scheduled_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'm3',
    title: 'Identify a night moth visitor',
    description: 'Check a light source near outdoor plants after dusk.',
    mission_type: 'learn',
    duration_minutes: 20,
    status: 'scheduled',
    location_hint: 'Porch light or park lamp',
    why_it_matters: 'Moths are essential nocturnal pollinators often overlooked.',
    scheduled_date: new Date().toISOString().slice(0, 10),
  },
];

let mockJournal = [
  {
    id: 'j1',
    title: 'Morning rain on cedar bark',
    body: 'The rain turned the dry cedar bark almost black. The smell of damp needles was unmistakable. Saw two chickadees flitting between lower branches.',
    mood: 'quiet',
    weather: 'Soft rain, 12°C',
    created_at: new Date().toISOString(),
  },
];

let mockPlaces = [
  {
    id: 'p1',
    name: 'Forest Park Edge',
    type: 'forest',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 12,
    best_time: 'Early morning',
    description: 'Ancient Douglas fir and fern canopy at the urban boundary.',
    why_it_matters: 'One of the largest urban forest reserves in the United States.',
    habitat: 'Temperate coniferous forest',
    map_x: 35,
    map_y: 42,
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    features: ['Old growth trees', 'Native ferns', 'Stream crossings'],
  },
  {
    id: 'p2',
    name: 'Willamette River Bank',
    type: 'wetland',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 20,
    best_time: 'Sunset',
    description: 'Riparian habitat supporting migratory waterfowl and river otters.',
    why_it_matters: 'Critical water corridor connecting cascade mountains to ocean.',
    habitat: 'Riverine wetland',
    map_x: 62,
    map_y: 68,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    features: ['Waterfowl watching', 'Gravel shore', 'Sunset views'],
  },
];

let mockActions = [
  { id: 'a1', title: 'Plant native wildflower seeds', category: 'Habitat', minutes: 30, status: 'recommended' },
  { id: 'a2', title: 'Install bird water dish', category: 'Wildlife', minutes: 15, status: 'recommended' },
  { id: 'a3', title: 'Leave leaf pile for hibernating insects', category: 'Soil', minutes: 10, status: 'recommended' },
];

let mockStories = [
  {
    id: 's1',
    title: 'The Silent Canopy Connection',
    narrative: 'Your recent observation of the Indian Myna and the Champa bloom reveals a shared urban shelter pattern.',
    created_at: new Date().toISOString(),
  },
];

let mockPulse = [];

async function getMockData(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  try {
    if (options.body) body = JSON.parse(options.body);
  } catch {}

  if (path.startsWith('/api/stories')) {
    if (path.endsWith('/generate') || path.endsWith('/assist')) {
      return { success: true, story: mockStories[0] };
    }
    if (method === 'POST') {
      const newStory = {
        id: `s-${Date.now()}`,
        title: body.title || 'Thread of Urban Adaptation',
        narrative: body.narrative || 'Across your latest notes, native flora and urban wildlife show an interconnected rhythm.',
        created_at: new Date().toISOString(),
      };
      mockStories = [newStory, ...mockStories];
      return newStory;
    }
    if (method === 'DELETE') {
      mockStories = mockStories.filter((s) => s.id !== body.id);
      return { success: true };
    }
    return mockStories;
  }

  if (path.startsWith('/api/analyze')) {
    return { ...DEMO_SPECIES[Math.floor(Math.random() * DEMO_SPECIES.length)], ai_available: false };
  }

  if (path.startsWith('/api/pulse')) {
    if (method === 'POST') {
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: body.content || '[Attached Image Observation]',
        created_at: new Date().toISOString(),
      };
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Demo Mode: this reply is a sample. Connect to the live server for real Pulse responses.',
        created_at: new Date().toISOString(),
      };
      mockPulse = [...mockPulse, userMsg, assistantMsg];
      return assistantMsg;
    }
    if (method === 'DELETE') {
      mockPulse = [];
      return { success: true };
    }
    return mockPulse;
  }

  if (path.startsWith('/api/profile')) {
    if (method === 'PUT') {
      mockProfile = { ...mockProfile, ...body, onboarding_complete: true };
    }
    return mockProfile;
  }

  if (path.startsWith('/api/connection')) {
    return { observe: 78, explore: 65, learn: 82, act: 54, return_dim: 70, overall: 74 };
  }

  if (path.startsWith('/api/missions')) {
    if (path.startsWith('/api/missions/') && method === 'PATCH') {
      const id = path.split('/').pop();
      mockMissions = mockMissions.map((m) => (m.id === id ? { ...m, ...body } : m));
      return mockMissions.find((m) => m.id === id);
    }
    if (method === 'POST') {
      const mission = { id: `m-${Date.now()}`, ...body, scheduled_date: new Date().toISOString().slice(0, 10) };
      mockMissions = [mission, ...mockMissions];
      return mission;
    }
    if (method === 'PUT' && body.id) {
      mockMissions = mockMissions.map((m) => (m.id === body.id ? { ...m, ...body } : m));
    }
    return mockMissions;
  }

  if (path.startsWith('/api/places')) {
    if (method === 'GET' && path.split('/').length === 4) {
      const id = path.split('/').pop();
      return mockPlaces.find((p) => p.id === id) || { error: 'Place not found' };
    }
    return mockPlaces;
  }

  if (path.startsWith('/api/discoveries')) {
    if (method === 'POST') {
      const newDisc = {
        id: `disc-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...body,
      };
      mockDiscoveries = [newDisc, ...mockDiscoveries];
      return newDisc;
    }
    if (method === 'DELETE') {
      mockDiscoveries = mockDiscoveries.filter((d) => d.id !== (body.id || path.split('/').pop()));
      return { success: true };
    }
    return mockDiscoveries;
  }

  if (path.startsWith('/api/upload')) {
    if (body.fileBase64) {
      return { url: `data:${body.contentType || 'image/jpeg'};base64,${body.fileBase64}` };
    }
    return { url: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?w=600&q=80' };
  }

  if (path.startsWith('/api/journal')) {
    if (method === 'POST') {
      const entry = { id: `j-${Date.now()}`, created_at: new Date().toISOString(), ...body };
      mockJournal = [entry, ...mockJournal];
      return entry;
    }
    if (method === 'DELETE') {
      mockJournal = mockJournal.filter((j) => j.id !== (body.id || path.split('/').pop()));
      return mockJournal;
    }
    return mockJournal;
  }

  if (path.startsWith('/api/actions')) {
    if (path.startsWith('/api/actions/')) {
      const id = path.split('/').pop();
      if (method === 'PATCH') {
        mockActions = mockActions.map((a) => (a.id === id ? { ...a, ...body } : a));
        return mockActions.find((a) => a.id === id);
      }
      if (method === 'DELETE') {
        mockActions = mockActions.filter((a) => a.id !== id);
        return { success: true };
      }
    }
    if (method === 'POST') {
      const action = { id: `a-${Date.now()}`, ...body };
      mockActions = [action, ...mockActions];
      return action;
    }
    return mockActions;
  }

  if (path.startsWith('/api/community')) {
    if (method === 'POST') {
      return { id: `post-${Date.now()}`, created_at: new Date().toISOString(), ...body };
    }
    return mockDiscoveries.map((d) => ({
      id: d.id,
      common_name: d.common_name,
      scientific_name: d.scientific_name,
      category: d.category,
      city: d.city || 'Portland',
      created_at: d.created_at,
    }));
  }

  if (path.startsWith('/api/streak')) {
    return { streak: 4, last_active: new Date().toISOString() };
  }

  if (path.startsWith('/api/best-time')) {
    return { suggestion: 'Golden hour — best light for observation', condition: 'morning' };
  }

  if (path.startsWith('/api/weekly-recap')) {
    return {
      slides: [
        { title: 'You explored 5 days this week', stat: '5', stat_label: 'days outside', description: 'Great job staying connected.' },
        { title: 'You discovered 3 species', stat: '3', stat_label: 'new species', species_list: ['Indian Myna', 'Champa (Plumeria)', 'Banyan Tree'] },
        { title: 'Your top find was the Champa', stat: '97%', stat_label: 'confidence', top_species: DEMO_SPECIES[1] },
      ],
      total_species: 3,
      total_days: 5,
    };
  }

  return {};
}

export async function apiFetch(path, options = {}, token = null) {
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${apiUrl}${cleanPath}`;
  const authToken = token || getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  if (isDemoMode()) {
    return getMockData(path, options);
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error('Cannot reach the NaturePulse server. Please try again.');
  }

  const data = await res.json().catch(() => ({}));

  if (res.ok) return data;

  if (res.status === 401 && !path.startsWith('/auth/')) {
    clearToken();
  }

  if (data?.error) {
    const err = new Error(data.error);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  const err = new Error(`Request failed (${res.status})`);
  err.status = res.status;
  err.data = data;
  throw err;
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
