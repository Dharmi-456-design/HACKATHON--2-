import { useState, useEffect } from 'react';
import { 
  Sparkles, Check, RefreshCw, Clock, Leaf, Shield, Flame, Globe, 
  Droplets, Bird, Compass, Heart, Share2, Award, Zap, ArrowRight, Sun, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Act Page
const ACT_TRANSLATIONS = {
  en: {
    heroTag: 'ENVIRONMENTAL ACTION ENGINE',
    heroTitle: 'Do What Fits',
    heroHighlight: 'Your Time 🍃',
    heroSubtitle: 'Modest, local, high-impact actions. Scale suggestions to your window — two minutes to sixty minutes.',
    sliderLabel: 'AVAILABLE TIME WINDOW',
    minutesSuffix: 'Minutes',
    generateBtnTitle: 'Generate Eco Actions',
    generateBtnSub: 'Get personalized actions',
    tabSuggested: 'Suggested Actions',
    tabCompleted: 'Field Actions Log',
    completeActionBtn: '✓ I Did This Action',
    completedBadge: 'Completed & Logged ✓',
    impactTotal: 'Total Impact Contributed',
    actionsDoneCount: 'ECO ACTIONS DONE',
    minutesContributed: 'MINUTES GIVEN TO NATURE',
  },
  gu: {
    heroTag: 'પર્યાવરણીય ક્રિયા એન્જિન',
    heroTitle: 'તમારા સમય અનુસાર',
    heroHighlight: 'કાર્ય કરો 🍃',
    heroSubtitle: 'સ્થાનિક અને ઉચ્ચ-અસરકારક પર્યાવરણીય કાર્યો. ૨ મિનિટથી ૬૦ મિનિટના ગાળામાં સૂચનો મેળવો.',
    sliderLabel: 'ઉપલબ્ધ સમય ગાળો',
    minutesSuffix: 'મિનિટ',
    generateBtnTitle: 'ઇકો ક્રિયાઓ જનરેટ કરો',
    generateBtnSub: 'વ્યક્તિગત સૂચનો મેળવો',
    tabSuggested: 'સૂચવેલ ક્રિયાઓ',
    tabCompleted: 'પૂર્ણ કરેલ કાર્યો',
    completeActionBtn: '✓ મેં આ કાર્ય પૂર્ણ કર્યું',
    completedBadge: 'પૂર્ણ કર્યું ✓',
    impactTotal: 'કુલ યોગદાન અસર',
    actionsDoneCount: 'પૂર્ણ કરેલ કાર્યો',
    minutesContributed: 'પ્રકૃતિને આપેલી મિનિટો',
  },
  hi: {
    heroTag: 'पर्यावरण कार्रवाई इंजन',
    heroTitle: 'अपने समय के अनुसार',
    heroHighlight: 'कार्य करें 🍃',
    heroSubtitle: 'स्थानीय और उच्च-प्रभाव वाले पर्यावरणीय कार्य। 2 मिनट से 60 मिनट की अवधि में सुझाव प्राप्त करें।',
    sliderLabel: 'उपलब्ध समय सीमा',
    minutesSuffix: 'मिनट',
    generateBtnTitle: 'इको कार्रवाइयां उत्पन्न करें',
    generateBtnSub: 'व्यक्तिगत सुझाव प्राप्त करें',
    tabSuggested: 'सुझाए गए कार्य',
    tabCompleted: 'पूर्ण किए गए कार्य',
    completeActionBtn: '✓ मैंने यह कार्य पूरा किया',
    completedBadge: 'पूर्ण किया गया ✓',
    impactTotal: 'कुल योगदान प्रभाव',
    actionsDoneCount: 'पूरे किए गए कार्य',
    minutesContributed: 'प्रकृति को दिए गए मिनट',
  },
};

// ──────────────── STATIC EXTRA POOL (outside component, no state refs) ────────────────
const EXTRA_POOL = [
  {
    title: 'Spot Migratory Raptors at Nal Sarovar Viewpoint',
    category: 'Raptor Watch',
    // Nal Sarovar — eagle/raptor soaring over open sky wetland
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Spend ${m} minutes scanning the skies above Nal Sarovar for Marsh Harriers and Ospreys during peak migration.`,
    place: 'Nal Sarovar Bird Sanctuary, Ahmedabad Rural',
    location: '22.7500° N, 72.0833° E',
    habitat: 'Open Wetland & Sky Watch',
    bestTime: 'November–January Mornings',
    wildlife: 'Marsh Harrier, Osprey, Black Kite, Brahminy Kite, Steppe Eagle',
    ecologicalRole: 'Nal Sarovar is a critical raptor corridor connecting the Rann of Kutch to central India flyways. Counting raptors helps conservation agencies track migration health.',
    impactNote: 'Raptor counts are used by BirdLife International for IUCN threat assessments.',
  },
  {
    title: 'Sketch Local Wildflowers at Law Garden',
    category: 'Botanical Art',
    // Law Garden Ahmedabad — lush green garden with flowers
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Sit at Law Garden Ahmedabad and illustrate ${m < 20 ? '2' : '4'} wildflower species in detail to build a field sketchbook entry.`,
    place: 'Law Garden, C.G. Road, Ahmedabad',
    location: '23.0368° N, 72.5558° E',
    habitat: 'Urban Heritage Garden',
    bestTime: 'Winter Mornings (Nov–Feb)',
    wildlife: 'Plum-headed Parakeet, Tailor Bird, Purple Sunbird, Common Myna',
    ecologicalRole: 'Law Garden hosts over 80 tree species and acts as an urban heat island buffer. Botanical sketches contribute to local flora digitization databases.',
    impactNote: 'Your sketches help build Ahmedabad first crowd-sourced urban flora atlas.',
  },
  {
    title: 'Count Fireflies at Polo Forest after Dusk',
    category: 'Night Ecology',
    // Polo Forest Sabarkantha — moonlit forest with firefly atmosphere
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Walk the Polo Forest trail near Idar for ${m} minutes after sunset and count firefly flashes as a light pollution indicator.`,
    place: 'Polo Forest, Sabarkantha, Gujarat',
    location: '23.6333° N, 73.0167° E',
    habitat: 'Deciduous Heritage Forest',
    bestTime: 'June–August Post-Sunset',
    wildlife: 'Firefly (Lamprigera), Barn Owl, Sambar Deer, Indian Porcupine, Wolf Spider',
    ecologicalRole: 'Polo Forest is one of Gujarat oldest protected heritage forests. Firefly presence is a direct indicator of light pollution absence and forest health.',
    impactNote: 'Firefly counts are used by researchers to map light pollution spread across Gujarat rural areas.',
  },
  {
    title: 'Monitor Mangrove Saplings at Aamlakhadi Creek',
    category: 'Mangrove Care',
    // Aamlakhadi Creek Jamnagar — coastal mangrove roots in tidal water
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Measure the height and leaf count of ${m < 20 ? '5' : '10'} mangrove saplings along Aamlakhadi creek bank and record survival rate.`,
    place: 'Aamlakhadi Creek, Jamnagar Coast, Gujarat',
    location: '22.4700° N, 70.0674° E',
    habitat: 'Tidal Mangrove Estuary',
    bestTime: 'Low Tide Morning',
    wildlife: 'Mudskipper, Fiddler Crab, Brahminy Kite, Little Egret, Mudcrab',
    ecologicalRole: 'Gujarat coastline has one of India largest mangrove restoration projects. Mangroves protect the shore from erosion and act as nurseries for marine fish.',
    impactNote: 'Sapling survival data feeds the Gujarat Forest Department Coastal Protection Programme.',
  },
  {
    title: 'Check Water Quality at Vastrapur Lake',
    category: 'Water Quality',
    // Vastrapur Lake Ahmedabad — calm blue urban lake with reflection
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Observe water clarity and algae cover at Vastrapur Lake for ${m} minutes, noting color and odor as basic water quality indicators.`,
    place: 'Vastrapur Lake, West Ahmedabad',
    location: '23.0401° N, 72.5238° E',
    habitat: 'Urban Freshwater Lake',
    bestTime: 'Early Morning Before 8 AM',
    wildlife: 'Great Crested Grebe, Cormorant, Pied Kingfisher, Bronze-winged Jacana',
    ecologicalRole: 'Vastrapur Lake is a vital stormwater retention basin. Algae bloom monitoring helps the AMC identify eutrophication before fish kills occur.',
    impactNote: 'Citizen water quality logs trigger AMC inspection visits and early intervention.',
  },
  {
    title: 'Photograph Seed Dispersers at Sanjay Van',
    category: 'Wildlife Photo',
    // Sanjay Van Gandhinagar — wildlife in green plantation forest
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
    descTemplate: (m) => `Spend ${m} minutes photographing birds and squirrels eating and dispersing fruit seeds at Sanjay Van urban forest.`,
    place: 'Sanjay Van Urban Forest, Gandhinagar',
    location: '23.2000° N, 72.6500° E',
    habitat: 'Urban Plantation Forest',
    bestTime: 'Early Morning or Late Afternoon',
    wildlife: 'Rose-ringed Parakeet, Five-striped Palm Squirrel, Purple-rumped Sunbird, Jungle Babbler',
    ecologicalRole: 'Seed dispersers are essential for forest regeneration. Documenting which birds eat which fruits helps map plant-animal networks in urban forests.',
    impactNote: 'Your photos contribute to the Gujarat urban reforestation seed network database.',
  },
];

export default function Act() {
  const { session } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = ACT_TRANSLATIONS[lang] || ACT_TRANSLATIONS.en;
  const token = session?.access_token;

  // Rich Ahmedabad & Gujarat nature place data
  const GUJARAT_PLACES = [
    {
      id: 'guj-1',
      title: 'Observe Sabarmati Riverfront Birds at Dawn',
      category: 'Birdwatch',
      minutes: 20,
      status: 'pending',
      // Sabarmati River waterfront — river with egrets/herons at dawn
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      description: 'Walk the Sabarmati Riverfront promenade and record birds — herons, kingfishers, and parakeets — in the golden dawn light.',
      place: 'Sabarmati Riverfront, Ahmedabad',
      location: '23.0333° N, 72.5820° E',
      habitat: 'Urban River Corridor',
      bestTime: 'Early Morning (5:30 AM – 7:30 AM)',
      wildlife: 'Grey Heron, Indian Roller, Purple Sunbird, Black Kite, Common Kingfisher',
      ecologicalRole: 'The river corridor acts as a critical flyway for migratory birds across Gujarat. Mangrove patches near the bank support nesting for 40+ species.',
      impactNote: 'Helps build the local bird count database for Ahmedabad urban biodiversity monitoring.',
    },
    {
      id: 'guj-2',
      title: 'Explore Thol Bird Sanctuary Wetlands',
      category: 'Wetland Walk',
      minutes: 45,
      status: 'pending',
      // Thol Lake — flamingos in pink wetland water
      image: 'https://images.unsplash.com/photo-1497206365907-f5e630693df0?auto=format&fit=crop&w=800&q=80',
      description: 'Trek the boardwalk at Thol Lake and scan for flamingos, painted storks, and migratory waders resting on shallow flats.',
      place: 'Thol Bird Sanctuary, Mehsana (near Ahmedabad)',
      location: '23.1833° N, 72.3500° E',
      habitat: 'Freshwater Wetland & Shallow Lake',
      bestTime: 'November–March (Winter Migration Season)',
      wildlife: 'Greater Flamingo, Painted Stork, Sarus Crane, Black-winged Stilt, Spot-billed Duck',
      ecologicalRole: 'Ramsar-listed wetland supporting 150+ migratory bird species annually. Acts as natural water filtration for surrounding farmland.',
      impactNote: 'Your observation count contributes to Gujarat Forest Department wetland health assessments.',
    },
    {
      id: 'guj-3',
      title: 'Document Banyan Trees at Nalsarovar',
      category: 'Tree Survey',
      minutes: 30,
      status: 'pending',
      // Nalsarovar — large lake with birds and shore trees
      image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
      description: 'Record ancient Banyan and Peepal tree girths along the Nalsarovar sanctuary shore and photograph aerial root systems.',
      place: 'Nalsarovar Bird Sanctuary, Sanand',
      location: '22.7500° N, 72.0833° E',
      habitat: 'Seasonal Wetland & Scrub Forest',
      bestTime: 'October–February',
      wildlife: 'Pelicans, Spoonbills, Cranes, Glossy Ibis, Jacana, Monitor Lizard',
      ecologicalRole: 'Nalsarovar covers 120 km² and is one of Gujarat largest bird sanctuaries. Banyan tree groves along the shore provide roost sites for hundreds of birds.',
      impactNote: 'Tree girth records help track canopy growth and carbon sequestration over time.',
    },
    {
      id: 'guj-4',
      title: 'Night Walk at Indroda Nature Park',
      category: 'Night Ecology',
      minutes: 35,
      status: 'pending',
      // Indroda Nature Park — dry deciduous forest trail at dusk
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      description: 'Join the evening eco-trail at Indroda Nature Park and listen for owls, crickets, and monsoon frogs under the canopy.',
      place: 'Indroda Nature Park (Dinosaur Park), Gandhinagar',
      location: '23.2156° N, 72.6369° E',
      habitat: 'Dry Deciduous Forest & Riparian Strip',
      bestTime: 'Post-Monsoon (August–October) Evenings',
      wildlife: 'Spotted Owlet, Indian Eagle-Owl, Jungle Cat, Indian Fox, Peacock',
      ecologicalRole: 'One of the largest fossil parks in Asia. The forest buffer alongside the Sabarmati headwater zone protects seasonal amphibian breeding pools.',
      impactNote: 'Night wildlife logs help identify urban wildlife corridors for future green infrastructure planning.',
    },
    {
      id: 'guj-5',
      title: 'Survey Parimal Garden Urban Pollinators',
      category: 'Pollinator Count',
      minutes: 15,
      status: 'pending',
      // Parimal Garden — lush garden with butterflies and flowering plants
      image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=800&q=80',
      description: 'Sit near flowering shrubs at Parimal Garden and count bee and butterfly species visiting blooms in a 10-minute window.',
      place: 'Parimal Garden, Ellisbridge, Ahmedabad',
      location: '23.0234° N, 72.5614° E',
      habitat: 'Urban Botanical Garden',
      bestTime: 'Morning (7 AM – 10 AM)',
      wildlife: 'Rock Bee, Common Mormon Butterfly, Crimson Rose, Lime Butterfly, Asian Honey Bee',
      ecologicalRole: 'Urban gardens like Parimal support pollinators displaced from agricultural land. Dense flower corridors improve surrounding neighbourhood fruit tree yields.',
      impactNote: 'Pollinator counts feed into city-wide urban biodiversity health scores for Ahmedabad Smart City mission.',
    },
    {
      id: 'guj-6',
      title: 'Soil Moisture Check at Kankaria Lakeshore',
      category: 'Soil & Water',
      minutes: 20,
      status: 'pending',
      // Kankaria Lake — calm urban lake with reflections and waterbirds
      image: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=800&q=80',
      description: 'Check soil compaction and moisture levels under shade trees around the Kankaria Lake perimeter using a simple stick test.',
      place: 'Kankaria Lake, Maninagar, Ahmedabad',
      location: '22.9965° N, 72.6007° E',
      habitat: 'Urban Lake Ecosystem',
      bestTime: 'Early Morning or Post-Monsoon',
      wildlife: 'Lesser Whistling Duck, Purple Moorhen, Painted Snipe, Indian Cormorant',
      ecologicalRole: 'Kankaria Lake is an artificial 15th-century reservoir supporting aquatic biodiversity in dense urban Ahmedabad. Shore vegetation buffers storm runoff.',
      impactNote: 'Soil moisture data helps city planners design bioswales and rain gardens around urban lakes.',
    },
  ];


  const toUiAction = (a) => ({
    id: a._id || a.id,
    title: a.title,
    category: a.category,
    minutes: a.minutes,
    status: a.status || 'pending',
    image: a.image_url || GUJARAT_PLACES[0].image,
    description: a.description,
    impactNote: a.impact_note || a.description,
    place: a.place || 'Ahmedabad, Gujarat',
    location: a.location || '23.0225° N, 72.5714° E',
    habitat: a.habitat || 'Urban Nature Corridor',
    bestTime: a.bestTime || 'Morning',
    wildlife: a.wildlife || 'Local species',
    ecologicalRole: a.ecologicalRole || a.description,
  });

  // Persistent States
  const [actions, setActions] = useState(GUJARAT_PLACES);
  const [generateCount, setGenerateCount] = useState(0);

  const [minutes, setMinutes] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [clickedCardId, setClickedCardId] = useState(null);
  const [activeTab, setActiveTab] = useState('suggested');
  const [actError, setActError] = useState('');

  useEffect(() => {
    apiFetch('/api/actions', {}, token)
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const merged = [...GUJARAT_PLACES, ...list.map(toUiAction).filter(a => !GUJARAT_PLACES.some(g => g.title === a.title))];
          setActions(merged);
        }
      })
      .catch(() => {});
  }, [token]);

  // Complete Action — moves card from Suggested to Field Actions Log
  const completeAction = (id) => {
    setActError('');
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a)));
    // Switch to completed tab to show the saved card
    setActiveTab('completed');
    // Persist to backend only for real DB IDs (not local guj-/gen- IDs)
    if (token && id && !String(id).startsWith('guj-') && !String(id).startsWith('gen-')) {
      apiFetch(`/api/actions/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }, token)
        .catch(() => {});
    }
  };

  // Generate New Actions — picks a unique place from EXTRA_POOL each time
  const handleGenerateActions = () => {
    setIsGenerating(true);
    setActError('');

    // Pick the next item from extra pool using generateCount as index (cycles)
    const poolIndex = generateCount % EXTRA_POOL.length;
    const template = EXTRA_POOL[poolIndex];

    // Build card with current minutes applied to the description
    const newCard = {
      id: `gen-${Date.now()}-${poolIndex}`,
      title: template.title,
      category: template.category,
      minutes,
      status: 'pending',
      image: template.image,
      description: template.descTemplate(minutes),
      place: template.place,
      location: template.location,
      habitat: template.habitat,
      bestTime: template.bestTime,
      wildlife: template.wildlife,
      ecologicalRole: template.ecologicalRole,
      impactNote: template.impactNote,
    };

    // Small artificial delay so the spinner feels real
    setTimeout(() => {
      setActions((prev) => [newCard, ...prev]);
      setGenerateCount((c) => c + 1);
      setIsGenerating(false);
    }, 800);
  };

  const { isDark } = useTheme();

  const pendingActions = actions.filter((a) => a.status !== 'completed');
  const completedActions = actions.filter((a) => a.status === 'completed');
  const totalMinutesGiven = completedActions.reduce((acc, b) => acc + b.minutes, 0);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER + SLIDER ──────────────── */}
        <div className="relative pt-6 pb-8 space-y-8">
          
          {/* Forest Backdrop */}
          <div 
            className="absolute -top-12 -left-12 -right-12 bottom-0 bg-cover bg-center pointer-events-none opacity-85"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1600&q=80')`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)'
            }}
          />

          {/* Gradient Blend Overlay */}
          <div className={`absolute -top-12 -left-12 -right-12 bottom-0 pointer-events-none ${
            isDark ? 'bg-gradient-to-b from-[#040C07]/75 via-[#040C07]/80 to-[#040B06]' : 'bg-gradient-to-b from-[#040C07]/60 via-[#040C07]/40 to-[#FAF7F0]'
          }`} />

          {/* Top Hero Row */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left Text Content */}
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4ADE80] bg-[#0E2015]/90 px-3.5 py-1 rounded-full border border-[#4ADE80]/40 backdrop-blur-md">
                <Leaf className="w-3.5 h-3.5" />
                {t.heroTag}
              </span>

              <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {t.heroTitle} <br />
                <span className="text-white">{t.heroHighlight.split(' ')[0]} </span>
                <span className="text-[#4ADE80]">{t.heroHighlight.split(' ')[1]}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-md drop-shadow">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Right Side Speedometer Clock HUD */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0 z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-emerald-500/40 flex items-center justify-center"
              >
                <div className="absolute top-1 w-1 h-3 bg-[#4ADE80]" />
                <div className="absolute bottom-1 w-1 h-3 bg-[#4ADE80]/40" />
                <div className="absolute left-1 w-3 h-1 bg-[#4ADE80]/40" />
                <div className="absolute right-1 w-3 h-1 bg-[#4ADE80]/40" />
                <div className="absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]" />
              </motion.div>

              <div className={`w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center text-center p-4 shadow-2xl backdrop-blur-md z-10 space-y-2 border ${
                isDark ? 'bg-[#0E2015]/95 border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7]/95 border-[#E3DDD1] text-[#0F2418] shadow-lg'
              }`}>
                <Leaf className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.actionsDoneCount}</p>
                  <p className={`font-display text-3xl font-black ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{completedActions.length}</p>
                </div>

                <div className={`w-12 h-px ${isDark ? 'bg-[#20422E]' : 'bg-[#E3DDD1]'}`} />

                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.minutesContributed}</p>
                  <p className={`font-display text-2xl font-black ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{totalMinutesGiven} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>MIN</span></p>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80"
                alt=""
                className="absolute right-0 bottom-0 w-36 h-36 object-cover opacity-75 mix-blend-screen pointer-events-none filter drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]"
              />
            </div>

          </div>

          {/* ──────────────── NEON GREEN ENERGY SLIDER STRIP ──────────────── */}
          <div className={`relative z-10 pt-4 border-t space-y-6 ${
            isDark ? 'border-[#20452F]/60' : 'border-[#E3DDD1]'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.sliderLabel}</p>
                <h3 className={`font-display text-4xl sm:text-5xl font-black mt-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  {minutes} <span className={`font-normal text-2xl sm:text-3xl ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.minutesSuffix}</span>
                </h3>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateActions}
                disabled={isGenerating}
                className="flex items-center gap-3 bg-transparent cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${
                  isDark
                    ? 'bg-[#13271C]/90 border-[#4ADE80]/50 text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-black'
                    : 'bg-[#FDFBF7] border-[#C3DEC0] text-[#183B28] group-hover:bg-[#183B28] group-hover:text-white shadow-sm'
                }`}>
                  <RefreshCw className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm transition-colors ${
                    isDark ? 'text-white group-hover:text-[#4ADE80]' : 'text-[#0F2418] group-hover:text-[#183B28]'
                  }`}>{t.generateBtnTitle}</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.generateBtnSub}</p>
                </div>
              </motion.button>
            </div>

            <div className="relative w-full py-4">
              <svg viewBox="0 0 800 30" className="w-full h-8 overflow-visible pointer-events-none">
                <path
                  d="M 0 15 Q 200 25, 400 15 T 800 15"
                  fill="none"
                  stroke={isDark ? '#20422E' : '#E0D8C8'}
                  strokeWidth="3"
                />
                <path
                  d={`M 0 15 Q 200 25, ${minutes * 13} 15`}
                  fill="none"
                  stroke={isDark ? '#4ADE80' : '#183B28'}
                  strokeWidth="3"
                  className="filter drop-shadow-[0_0_8px_#4ADE80]"
                />
              </svg>

              <input
                type="range"
                min={2}
                max={60}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-8"
              />

              <div
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 shadow-md pointer-events-none transition-all ${
                  isDark ? 'bg-[#4ADE80] border-[#040B06] shadow-[0_0_15px_#4ADE80]' : 'bg-[#183B28] border-white'
                }`}
                style={{ left: `calc(${(minutes / 60) * 95}% + 10px)` }}
              />
            </div>
          </div>

        </div>

        {/* ──────────────── UNDERLINE TAB NAVIGATION ──────────────── */}
        <div className={`flex items-center gap-8 border-b pb-4 relative z-10 ${
          isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
        }`}>
          <button
            onClick={() => setActiveTab('suggested')}
            className={`flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${
              activeTab === 'suggested'
                ? isDark ? 'text-[#4ADE80]' : 'text-[#183B28] font-extrabold'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>{t.tabSuggested} ({pendingActions.length})</span>
            {activeTab === 'suggested' && (
              <motion.div layoutId="actTab" className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'
              }`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${
              activeTab === 'completed'
                ? isDark ? 'text-[#4ADE80]' : 'text-[#183B28] font-extrabold'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabCompleted} ({completedActions.length})</span>
            {activeTab === 'completed' && (
              <motion.div layoutId="actTab" className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'
              }`} />
            )}
          </button>
        </div>

        {/* ──────────────── ACTION CARDS GRID WITH REAL HD IMAGES & 3D FLIP ──────────────── */}
        {activeTab === 'suggested' && (
          <div className="relative z-10">
            {actError && (
              <div className="mb-5 bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500">
                {actError}
              </div>
            )}
            {pendingActions.length === 0 && (
              <div className={`border border-dashed rounded-3xl p-10 text-center space-y-3 ${
                isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
              }`}>
                <p className="text-3xl">🌿</p>
                <p className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>No suggested actions</p>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Pick a time window above and generate an eco action to get started.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingActions.map((action) => {
              const isFlipped = flippedCardId === action.id;
              return (
                <div
                  key={action.id}
                  className="perspective-1000 h-96 cursor-pointer"
                  onMouseEnter={() => { if (clickedCardId !== action.id) setFlippedCardId(action.id); }}
                  onMouseLeave={() => { if (clickedCardId !== action.id) setFlippedCardId(null); }}
                  onClick={() => {
                    if (clickedCardId === action.id) {
                      setClickedCardId(null);
                      setFlippedCardId(null);
                    } else {
                      setClickedCardId(action.id);
                      setFlippedCardId(action.id);
                    }
                  }}
                >
                  <motion.div
                    className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                  >
                    {/* FRONT ACTION CARD */}
                    <div className={`absolute inset-0 backface-hidden rounded-3xl overflow-hidden flex flex-col justify-between border transition-colors ${
                      isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
                    }`}>
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={action.image}
                          alt={action.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border ${
                            isDark ? 'bg-[#07130B]/80 text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                          }`}>
                            {action.category}
                          </span>
                        </div>
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/40">
                          ⏱️ {action.minutes} min
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className={`font-display text-lg font-bold leading-tight ${
                            isDark ? 'text-white' : 'text-[#0F2418]'
                          }`}>
                            {action.title}
                          </h3>
                          <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                          }`}>
                            {action.description}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            completeAction(action.id);
                          }}
                          className={`w-full py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                            isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{t.completeActionBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* BACK ACTION CARD — Full Place Details */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden flex flex-col border transition-colors ${
                      isDark ? 'bg-[#061209] border-[#4ADE80]/50' : 'bg-[#F2ECE1] border-[#E0D8C8] shadow-sm'
                    }`}>
                      {/* Mini image strip at top */}
                      <div className="relative h-20 overflow-hidden shrink-0">
                        <img src={action.image} alt={action.title} className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#061209]" />
                        <span className="absolute bottom-2 left-3 text-[10px] font-bold text-[#4ADE80] bg-[#07130B]/80 px-2 py-0.5 rounded-full border border-[#4ADE80]/30">
                          📍 {action.place || 'Ahmedabad, Gujarat'}
                        </span>
                      </div>

                      {/* Details body */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                        <h4 className="font-display text-sm font-bold text-white leading-tight">{action.title}</h4>

                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex gap-2">
                            <span className="text-[#4ADE80] font-bold w-16 shrink-0">🌍 Habitat</span>
                            <span className="text-slate-300">{action.habitat || 'Urban Nature Corridor'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[#4ADE80] font-bold w-16 shrink-0">⏰ Best Time</span>
                            <span className="text-slate-300">{action.bestTime || 'Morning'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[#4ADE80] font-bold w-16 shrink-0">🐦 Wildlife</span>
                            <span className="text-slate-300">{action.wildlife || 'Local species'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[#4ADE80] font-bold w-16 shrink-0">🌱 Eco Role</span>
                            <span className="text-slate-300 leading-relaxed">{action.ecologicalRole || action.impactNote}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-2 border-t border-[#20422E] flex justify-between items-center text-[10px] shrink-0">
                        <span className="text-slate-400">📌 {action.location || '23.0225° N, 72.5714° E'}</span>
                        <span className="font-bold text-[#4ADE80]">+{action.minutes * 2} XP</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* COMPLETED ACTIONS TAB */}
        {activeTab === 'completed' && (
          <div className="relative z-10">
            {completedActions.length === 0 && (
              <div className={`border border-dashed rounded-3xl p-10 text-center space-y-3 ${
                isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
              }`}>
                <p className="text-3xl">🏅</p>
                <p className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>No completed actions yet</p>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Click "I Did This Action" on any card to save it here as a logged field action.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedActions.map((action) => (
                <div key={action.id} className={`rounded-3xl overflow-hidden border shadow-xl flex flex-col ${
                  isDark ? 'bg-[#0E2015] border-[#4ADE80]/50' : 'bg-[#FDFBF7] border-[#C3DEC0] shadow-sm'
                }`}>
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img src={action.image} alt={action.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                    {/* Completed badge overlay */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#4ADE80]/90 text-[#07130B] text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Logged ✓
                    </span>
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border ${
                      isDark ? 'bg-[#07130B]/80 text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                    }`}>
                      {action.category}
                    </span>
                    <span className="absolute bottom-2 left-3 text-[10px] font-bold text-white/90">
                      📍 {action.place || 'Ahmedabad, Gujarat'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 space-y-2">
                    <h3 className={`font-display text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                      {action.title}
                    </h3>
                    <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                      {action.description}
                    </p>

                    <div className="space-y-1 pt-1 text-[10px]">
                      <div className="flex gap-2">
                        <span className="text-[#4ADE80] font-bold w-14 shrink-0">🌍 Habitat</span>
                        <span className={isDark ? 'text-slate-300' : 'text-[#2D4536]'}>{action.habitat || 'Urban Nature'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#4ADE80] font-bold w-14 shrink-0">🐦 Wildlife</span>
                        <span className={isDark ? 'text-slate-300' : 'text-[#2D4536]'}>{action.wildlife || 'Local species'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#4ADE80] font-bold w-14 shrink-0">🌱 Eco</span>
                        <span className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#2D4536]'}`}>{action.ecologicalRole || action.impactNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-2.5 border-t flex justify-between items-center text-[10px] ${
                    isDark ? 'border-[#20422E] text-slate-400' : 'border-[#E3DDD1] text-[#3E5C48]'
                  }`}>
                    <span>📌 {action.location || '23.0225° N, 72.5714° E'}</span>
                    <span className={`font-bold text-sm ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>+{action.minutes * 2} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── BIOLUMINESCENT WAVY ENERGY RIBBON DIVIDER WITH FIREFLY PARTICLES ──────────────── */}
        <div className="relative py-12 overflow-hidden pointer-events-none z-10">
          <div className="relative w-full h-16 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3], x: [-20, 20, -20] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/4 top-2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6EE7B7]"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], x: [15, -15, 15] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute left-1/2 top-8 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_14px_#FCD34D]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.8, 0.2], x: [-10, 10, -10] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute right-1/4 top-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34D399]"
            />

            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full opacity-80">
              <path
                d="M 0 60 Q 300 10, 600 70 T 1200 40"
                fill="none"
                stroke="url(#waveGrad1)"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]"
              />
              <path
                d="M 0 40 Q 300 90, 600 30 T 1200 80"
                fill="none"
                stroke="url(#waveGrad2)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              <defs>
                <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#040B06" stopOpacity="0" />
                  <stop offset="30%" stopColor="#4ADE80" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#22C55E" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#040B06" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="waveGrad2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#040B06" stopOpacity="0" />
                  <stop offset="40%" stopColor="#A7F3D0" stopOpacity="0.7" />
                  <stop offset="80%" stopColor="#4ADE80" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#040B06" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
