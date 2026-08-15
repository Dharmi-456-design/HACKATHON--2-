import { isDemoMode, DEMO_SPECIES, demoWeeklyRecap, demoStreak } from '../utils/demoMode';

// In-memory mock state for demo mode
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
  category: s.category,
  description: s.description,
  why_it_matters: s.why_it_matters,
  experience_suggestion: s.experience_suggestion,
  place_name: 'Forest Park edge',
  city: 'Portland',
  created_at: new Date(Date.now() - idx * 86400000).toISOString(),
  is_public: true,
  image_url:
    idx === 0
      ? 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?w=600&q=80'
      : idx === 1
      ? 'https://images.unsplash.com/photo-1596073413225-300dd1d416c2?w=600&q=80'
      : 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
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
    narrative: 'Your recent observation of the Indian Myna and the Champa bloom reveals a shared urban shelter pattern. Both species thrive along the micro-climates created near residential garden boundaries, where soil moisture remains higher after dawn.',
    created_at: new Date().toISOString(),
  },
];

let mockPulse = [
  {
    id: 1,
    role: 'assistant',
    content: 'Welcome back! I am Pulse, your ecological guide. Tell me about your surroundings today or what species you are curious about.',
    created_at: new Date().toISOString(),
  },
];

function getMockData(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  try {
    if (options.body) body = JSON.parse(options.body);
  } catch {}

  if (path.startsWith('/api/stories')) {
    if (method === 'POST') {
      const newStory = {
        id: `s-${Date.now()}`,
        title: 'Thread of Urban Adaptation',
        narrative: 'Across your latest notes, native flora and urban wildlife show an interconnected rhythm. Moisture retention in garden bark directly supports insect foraging for local bird species.',
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

  if (path.startsWith('/api/pulse')) {
    if (method === 'POST') {
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: body.content || '',
        created_at: new Date().toISOString(),
      };
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I hear you! Paying attention to "${body.content}" opens up a wonderful window into your local ecosystem. Try spending 5 quiet minutes observing how light and shadow change across that spot.`,
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
    if (method === 'PUT' && body.id) {
      mockMissions = mockMissions.map((m) => (m.id === body.id ? { ...m, status: 'completed' } : m));
    }
    return mockMissions;
  }

  if (path.startsWith('/api/places')) {
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
      mockDiscoveries = mockDiscoveries.filter((d) => d.id !== body.id);
      return { success: true };
    }
    return mockDiscoveries;
  }

  if (path.startsWith('/api/upload')) {
    return { url: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?w=600&q=80' };
  }

  if (path.startsWith('/api/journal')) {
    if (method === 'POST') {
      const entry = { id: `j-${Date.now()}`, created_at: new Date().toISOString(), ...body };
      mockJournal = [entry, ...mockJournal];
      return mockJournal;
    }
    if (method === 'DELETE') {
      mockJournal = mockJournal.filter((j) => j.id !== body.id);
      return mockJournal;
    }
    return mockJournal;
  }

  if (path.startsWith('/api/actions')) {
    return mockActions;
  }

  if (path.startsWith('/api/community')) {
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
  // If demo mode is active, directly use mock data
  if (isDemoMode() || sessionStorage.getItem('np_demo_login') === '1') {
    return getMockData(path, options);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Fallback to mock data if API is 404/500/unreachable
      return getMockData(path, options);
    }
    return data;
  } catch (err) {
    // Fallback to mock data on network error (e.g. backend server not running)
    return getMockData(path, options);
  }
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
