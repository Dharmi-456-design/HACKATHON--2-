import { isDemoMode, DEMO_SPECIES } from '../utils/demoMode';

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
    narrative: 'Your recent observation of the Indian Myna and the Champa bloom reveals a shared urban shelter pattern.',
    created_at: new Date().toISOString(),
  },
];

let mockPulse = [];

function generatePulseResponse(content = '', language = 'en') {
  const query = content.toLowerCase().trim();

  // Extract name if introduced
  let name = '';
  const nameMatch = query.match(/(?:my name is|maru name|mera naam)\s+([a-zA-Z]+)/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
  }

  // Questions about Photosynthesis
  if (
    query.includes('photosynthesis') ||
    query.includes('પ્રકાશસંશ્લેષણ') ||
    query.includes('प्रकाश संश्लेषण')
  ) {
    if (language === 'gu') {
      return `પ્રકાશસંશ્લેષણ એ એવી પ્રક્રિયા છે જેના દ્વારા લીલા છોડ અને વૃક્ષો પોષક તત્ત્વો બનાવવા અને વાતાવરણમાં ઓક્સિજન છોડવા માટે સૂર્યપ્રકાશ, પાણી અને કાર્બન ડાયોક્સાઇડનો ઉપયોગ કરે છે.`;
    }
    if (language === 'hi') {
      return `प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा हरे पौधे और पेड़ पोषक तत्वों को संश्लेषित करने और वायुमंडल में ऑक्सीजन छोड़ने के लिए सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करते हैं।`;
    }
    return `Photosynthesis is the process by which green plants and trees use sunlight, water, and carbon dioxide to synthesize nutrients and release oxygen into the atmosphere.`;
  }

  // Specific questions about birds / lakes / water
  if (
    query.includes('bird') ||
    query.includes('પક્ષી') ||
    query.includes('पक्षी') ||
    query.includes('lake') ||
    query.includes('તળાવ') ||
    query.includes('झील') ||
    query.includes('water')
  ) {
    if (language === 'gu') {
      return `તળાવ કે જળાશય પાસે સવારે તમે કિંગફિશર (કિલકિલા), બગલા (Egret), જળમુરઘી (Coot) અને બતક જોઈ શકો છો. સવારે 6 થી 8 ની વચ્ચે શાંતિથી સૂર્યોદય સમયે અવલોકન કરવાથી પક્ષીઓની ગતિવિધિ સૌથી વધુ જોવા મળે છે.`;
    }
    if (language === 'hi') {
      return `सुबह के समय झील के पास आप किंगफिशर, बगुला (Egret), जलमुर्गी (Coot) और बत्तख देख सकते हैं। सुबह 6 से 8 बजे के बीच शांत बैठकर देखने से पक्षियों की सबसे सुंदर गतिविधियां दिखाई देती हैं।`;
    }
    return `Near a lake in the morning, you can typically spot Kingfishers, Egrets, Coots, and Herons. Early morning between 6:00 AM and 8:00 AM is the ideal time to observe their feeding and flight patterns.`;
  }

  // Specific questions about trees / plants / flora
  if (
    query.includes('tree') ||
    query.includes('વૃક્ષ') ||
    query.includes('પેડ') ||
    query.includes('पेड़') ||
    query.includes('plant') ||
    query.includes('છોડ') ||
    query.includes('पौधा')
  ) {
    if (language === 'gu') {
      return `સ્થાનિક વૃક્ષો જેમ કે પીપળો, વડ, લીમડો અને ગુલમોહર સ્થાનિક પક્ષીઓ અને જંતુઓ માટે આશ્રયસ્થાન પ્રદાન કરે છે. તમે તેમના પાંદડાની રચના અને છાલનો રંગ જોઈને ઓળખી શકો છો.`;
    }
    if (language === 'hi') {
      return `स्थानीय पेड़ जैसे पीपल, बरगद, नीम और गुलमोहर स्थानीय पक्षियों और कीटों को आश्रय देते हैं। आप उनकी पत्तियों की बनावट और छाल के रंग से उन्हें आसानी से पहचान सकते हैं।`;
    }
    return `Local trees like Banyan, Neem, Peepal, and Gulmohar provide critical shelter for native birds and pollinators. Look closely at leaf margins and bark texture to spot subtle variations.`;
  }

  // General introductory intent
  const isGeneralPrompt =
    query.includes('want to know') ||
    query.includes('janva mangu') ||
    query.includes('jaanna chahta') ||
    query.includes('jaanna chahti') ||
    query.includes('tell me something') ||
    query.includes('kuch batao') ||
    query.includes('kaik janva') ||
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query.includes('namaste') ||
    query.includes('maru name') ||
    query.includes('mera naam');

  if (isGeneralPrompt) {
    if (language === 'gu') {
      const greeting = name ? `નમસ્તે ${name}! ` : `નમસ્તે! `;
      return `${greeting}ચોક્કસ, તમે આજે શું જાણવા માંગો છો? મને તમારી આસપાસના પક્ષીઓ, વૃક્ષો, છોડ અથવા વાતાવરણ વિશે પૂછો.`;
    }
    if (language === 'hi') {
      const greeting = name ? `नमस्ते ${name}! ` : `नमस्ते! `;
      return `${greeting}बिल्कुल, आप क्या जानना चाहते हैं? मुझसे अपने आस-पास के पक्षियों, पेड़ों, पौधों या वातावरण के बारे में पूछें।`;
    }
    const greeting = name ? `Hello ${name}! ` : `Hello! `;
    return `${greeting}Sure, what would you like to know today? Feel free to ask me about local birds, trees, plants, or the ecosystem around you.`;
  }

  // Default intelligent response without echoing or quoting user input
  if (language === 'gu') {
    return `આ એક ખૂબ જ અદ્ભુત પ્રશ્ન છે. તમારી સ્થાનિક ઇકોસિસ્ટમમાં જૈવવિવિધતા ખૂબ જ સમૃદ્ધ છે. જો તમે તમારી આસપાસના ચોક્કસ સ્થળ વિશે જણાવશો, તો હું તમને વધુ ચોક્કસ માહિતી આપી શકીશ.`;
  }
  if (language === 'hi') {
    return `यह बहुत ही बेहतरीन सवाल है। आपके स्थानीय पारिस्थितिकी तंत्र में जैव विविधता बहुत समृद्ध है। यदि आप अपने आस-पास के किसी विशिष्ट स्थान के बारे में बताएंगे, तो मैं आपको और सटीक जानकारी दे सकूंगा।`;
  }
  return `That is a great observation. Your local ecosystem is filled with subtle biodiversity rhythms. If you tell me more about your specific location or the time of day, I can give you even more targeted insights.`;
}

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
        narrative: 'Across your latest notes, native flora and urban wildlife show an interconnected rhythm.',
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
        content: body.content || '[Attached Image Observation]',
        created_at: new Date().toISOString(),
      };

      let replyContent;
      if (body.imageBase64) {
        if (body.language === 'gu') {
          replyContent = 'આ તસવીરમાં કુદરતી વનસ્પતિ અને તેની સપાટીની રચના સ્પષ્ટ દેખાય છે. આ સૂક્ષ્મ-પર્યાવરણ સ્થાનિક પક્ષીઓ અને કીટકો માટે ભેજ અને આશ્રય પૂરો પાડે છે. આને ૨ મિનિટ સુધી નજીકથી જોઈને તેની બનાવટ અનુભવો.';
        } else if (body.language === 'hi') {
          replyContent = 'इस प्राकृतिक अवलोकन में पौधों की सूक्ष्म संरचना और बनावट साफ दिखाई दे रही है। यह स्थानीय परागणकों और पक्षियों के लिए एक प्राकृतिक आश्रय है। इसे कुछ मिनट ध्यान से देखें और इसकी बनावट को महसूस करें।';
        } else {
          replyContent = 'I can see the natural foliage patterns and living textures in this observation. This micro-habitat helps retain ambient moisture and provides vital shelter for local pollinators and foraging birds. Take 2 quiet minutes to observe the fine details and textures along its edges.';
        }
      } else {
        replyContent = generatePulseResponse(body.content, body.language);
      }

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyContent,
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
    if (body.fileBase64) {
      return { url: `data:${body.contentType || 'image/jpeg'};base64,${body.fileBase64}` };
    }
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
  const apiUrl = import.meta.env.VITE_API_URL;

  // If in demo mode or no remote API backend configured, use rich local mock data
  if (!apiUrl || isDemoMode() || sessionStorage.getItem('np_demo_login') === '1') {
    return getMockData(path, options);
  }

  const url = apiUrl.endsWith('/') ? `${apiUrl.slice(0, -1)}${path}` : `${apiUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return getMockData(path, options);
    }
    return data;
  } catch (err) {
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
