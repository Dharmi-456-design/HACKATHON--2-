import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, Compass, Bookmark, Heart, Zap, Smile, Brain, 
  ChevronRight, Play, RotateCcw, Share2, Plus, X, Wand2, Layers, 
  Globe, ArrowLeft, Check, Flame, MessageCircle, Star, Sliders, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Stories Universe
const STORIES_TRANSLATIONS = {
  en: {
    heroTag: 'INTERACTIVE STORY UNIVERSE',
    heroTitle: 'Cinematic AI & Nature Chronicles',
    heroSubtitle: 'Step into immersive 3D narratives, shape branching paths, and generate custom stories powered by AI.',
    createStoryBtn: 'Create Custom Story',
    featuredTitle: 'The Whispering Redwood Canopy',
    featuredDesc: 'An ancient canopy conceals a neural web of bioluminescent fungi. Follow Maya as she decodes the forest heartbeat.',
    continueReading: 'Continue Reading',
    readStory: 'Read Story',
    interactiveMode: 'Interactive Choice Path',
    tabAll: 'Explore Universe',
    tabMyStories: '📚 My Library',
    tabFavorites: '⭐ Favorites',
    tabInteractive: '🔀 Branching Paths',
    genreAll: 'All Genres',
    genreFantasy: '✨ Fantasy',
    genreSciFi: '🚀 Sci-Fi',
    genreNature: '🌿 Nature & Eco',
    genreMystery: '🕵️ Mystery',
    genreAdventure: '🌍 Adventure',
    genreEdu: '📚 Educational',
    createModalTitle: 'Weave an AI Story',
    promptLabel: 'Story Prompt or Core Idea',
    titleLabel: 'Story Title',
    genreLabel: 'Genre',
    moodLabel: 'Atmospheric Mood',
    generateBtn: 'Generate Story with AI',
    generatingText: 'Weaving story threads & neural paths…',
    aiAssistantTitle: 'AI Story Assistant',
    rewriteSection: '🪄 Rewrite Section',
    changeMood: '🎭 Change Mood',
    alternateEnding: '🔮 Alternate Ending',
    translateStory: '🌐 Translate Story',
    choicePrompt: 'What will you do next?',
    magical: 'Magical',
    lovedIt: 'Loved It',
    unexpected: 'Unexpected',
    funny: 'Funny',
    thoughtful: 'Thoughtful',
    savedInLibrary: 'Saved to Library',
    saveToLibrary: 'Save Story',
  },
  gu: {
    heroTag: 'ઇન્ટરેક્ટિવ વાર્તા વિશ્વ',
    heroTitle: 'સિનેમેટિક એઆઈ અને પ્રકૃતિ વાર્તાઓ',
    heroSubtitle: 'ઇમર્સિવ 3D વાર્તાઓમાં પ્રવેશ કરો, નવો માર્ગ પસંદ કરો અને એઆઈ દ્વારા કસ્ટમ વાર્તાઓ બનાવો.',
    createStoryBtn: 'કસ્ટમ વાર્તા બનાવો',
    featuredTitle: 'વ્હિસ્પરિંગ રેડવુડ કેનોપી',
    featuredDesc: 'એક પ્રાચીન વૃક્ષની છત્ર બાયોલ્યુમિનેસન્ટ ફૂગના ચેતાતંત્રને છુપાવે છે. માયા જ્યારે જંગલના ધબકારાને સમજે છે ત્યારે તેનું પાલન કરો.',
    continueReading: 'વાંચન ચાલુ રાખો',
    readStory: 'વાર્તા વાંચો',
    interactiveMode: 'ઇન્ટરેક્ટિવ પસંદગી માર્ગ',
    tabAll: 'બ્રહ્માંડ શોધો',
    tabMyStories: '📚 મારી લાઇબ્રેરી',
    tabFavorites: '⭐ મનપસંદ',
    tabInteractive: '🔀 શાખા માર્ગો',
    genreAll: 'બધી શૈલીઓ',
    genreFantasy: '✨ કલ્પનાશક્તિ',
    genreSciFi: '🚀 સાયન્સ ફિક્શન',
    genreNature: '🌿 પ્રકૃતિ અને ઇકો',
    genreMystery: '🕵️ રહસ્ય',
    genreAdventure: '🌍 સાહસ',
    genreEdu: '📚 શૈક્ષણિક',
    createModalTitle: 'એઆઈ વાર્તા બનાવો',
    promptLabel: 'વાર્તાનો વિચાર',
    titleLabel: 'વાર્તાનું શીર્ષક',
    genreLabel: 'શૈલી',
    moodLabel: 'વાતાવરણ નો મૂડ',
    generateBtn: 'એઆઈ સાથે વાર્તા બનાવો',
    generatingText: 'વાર્તાના તાંતણા વણાઈ રહ્યા છે…',
    aiAssistantTitle: 'એઆઈ સ્ટોરી આસિસ્ટન્ટ',
    rewriteSection: '🪄 વિભાગ ફરીથી લખો',
    changeMood: '🎭 મૂડ બદલો',
    alternateEnding: '🔮 વૈકલ્પિક અંત',
    translateStory: '🌐 વાર્તા અનુવાદ કરો',
    choicePrompt: 'તમે આગળ શું કરશો?',
    magical: 'જાદુઈ',
    lovedIt: 'ખૂબ ગમ્યું',
    unexpected: 'અણધાર્યું',
    funny: 'રમુજી',
    thoughtful: 'વિચારપ્રેરક',
    savedInLibrary: 'લાઇબ્રેરીમાં સંગ્રહિત',
    saveToLibrary: 'વાર્તા સાચવો',
  },
  hi: {
    heroTag: 'इंटरैक्टिव कहानी दुनिया',
    heroTitle: 'सिनेमैटिक एआई और प्रकृति कहानियां',
    heroSubtitle: 'थ्रीडी कहानियों में प्रवेश करें, नए रास्ते चुनें और एआई द्वारा कस्टम कहानियां बनाएं।',
    createStoryBtn: 'कस्टम कहानी बनाएं',
    featuredTitle: 'विस्परिंग रेडवुड कैनोपी',
    featuredDesc: 'एक प्राचीन पेड़ की छत्र छाया बायोल्यूमिनसेंट कवक के तंत्रिका तंत्र को छिपाती है। माया के साथ जंगल की धड़कन को समझें।',
    continueReading: 'पढ़ना जारी रखें',
    readStory: 'कहानी पढ़ें',
    interactiveMode: 'इंटरैक्टिव विकल्प पथ',
    tabAll: 'दुनिया खोजें',
    tabMyStories: '📚 मेरी लाइब्रेरी',
    tabFavorites: '⭐ पसंदीदा',
    tabInteractive: '🔀 शाखा वाले रास्ते',
    genreAll: 'सभी शैलियां',
    genreFantasy: '✨ कल्पना',
    genreSciFi: '🚀 साइंस फिक्शन',
    genreNature: '🌿 प्रकृति और इको',
    genreMystery: '🕵️ रहस्य',
    genreAdventure: '🌍 साहसिक',
    genreEdu: '📚 शैक्षणिक',
    createModalTitle: 'एआई कहानी बनाएं',
    promptLabel: 'कहानी का विचार',
    titleLabel: 'कहानी का शीर्षक',
    genreLabel: 'शैली',
    moodLabel: 'वातावरण का मूड',
    generateBtn: 'एआई के साथ कहानी बनाएं',
    generatingText: 'कहानी के धागे बुने जा रहे हैं…',
    aiAssistantTitle: 'एआई स्टोरी असिस्टेंट',
    rewriteSection: '🪄 अनुभाग फिर से लिखें',
    changeMood: '🎭 मूड बदलें',
    alternateEnding: '🔮 वैकल्पिक अंत',
    translateStory: '🌐 कहानी का अनुवाद करें',
    choicePrompt: 'आप आगे क्या करेंगे?',
    magical: 'जादुई',
    lovedIt: 'बहुत पसंद आया',
    unexpected: 'अनपेक्षित',
    funny: 'मजेदार',
    thoughtful: 'विचारोत्तेजक',
    savedInLibrary: 'लाइब्रेरी में सहेजा गया',
    saveToLibrary: 'कहानी सहेजें',
  },
};

// Rich Pre-Built Seed Stories with Interactive Choice Paths & 3D Artwork
const SEED_STORIES = [
  {
    id: 'story-201',
    title: 'The Whispering Redwood Canopy',
    genre: '✨ Fantasy',
    mood: 'Mystical',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    summary: 'An ancient redwood canopy conceals a neural web of bioluminescent fungi. Follow Maya as she decodes the forest heartbeat.',
    narrative: `The mist hung low over the old-growth Pacific grove. Maya stepped carefully across the moss-covered roots of an 800-year-old Redwood. 

Her field scanner pulsed green — detecting faint electrical impulses passing between the tree roots and subterranean mycelium.

"It is not just a tree," she whispered into her journal. "It is a living neural network."

Suddenly, a faint glow illuminated the hollow trunk ahead. Two distinct pathways emerged from the ancient roots...`,
    isInteractive: true,
    choices: [
      {
        id: 'c1',
        text: '🔵 Descend into the subterranean fungal glow cave',
        nextText: `Maya climbed down into the hollow root chamber. Hundreds of tiny blue bioluminescent caps pulsed in rhythm with her heartbeat. Deep within the cavern, an ancient stone altar held a crystal filled with forest sap...`,
      },
      {
        id: 'c2',
        text: '🟣 Ascend the spiral bark ladder towards the canopy skywalk',
        nextText: `Securing her safety harness, Maya climbed higher into the misty canopy. At 250 feet above the forest floor, a pair of rare Northern Spotted Owls greeted her, guarding a glowing cedar nest...`,
      },
    ],
    reactions: { magical: 42, lovedIt: 58, unexpected: 19, funny: 4, thoughtful: 31 },
    isFeatured: true,
    progress: 75,
  },
  {
    id: 'story-202',
    title: 'Chrono-Ecology 2085: The Silent Reef',
    genre: '🚀 Sci-Fi',
    mood: 'Futuristic',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    summary: 'In a ocean habitat restored by autonomous micro-drones, marine biologist Leo discovers an artificial coral intelligence.',
    narrative: `Deep underwater in the Great Barrier Sanctuary of 2085, automated solar-powered drones tended to living coral bio-polymers. 

Leo adjusted his acoustic hydro-visor. Instead of silent water, his earpiece registered harmonic frequencies emitted by the synthetic reef structures.

The coral was self-organizing — adapting its molecular density to withstand warming currents.`,
    isInteractive: false,
    reactions: { magical: 31, lovedIt: 45, unexpected: 28, funny: 2, thoughtful: 49 },
    isFeatured: false,
    progress: 30,
  },
  {
    id: 'story-203',
    title: 'The Secret Language of Migratory Sunbirds',
    genre: '🌿 Nature & Eco',
    mood: 'Calm & Educational',
    readTime: '3 min read',
    coverImage: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?w=800&q=80',
    summary: 'Discover how purple sunbirds navigate thousands of miles using Earth’s magnetic field and flowering plant scents.',
    narrative: `Before sunrise, a tiny male Purple Sunbird flutters near a blooming Champa tree. Weighing less than a coin, its tiny heart beats 1,000 times per minute.

By detecting subtle fluctuations in magnetic dip angles, the bird maps out safe flight corridors across urban landscapes.`,
    isInteractive: false,
    reactions: { magical: 24, lovedIt: 62, unexpected: 11, funny: 5, thoughtful: 38 },
    isFeatured: false,
    progress: 100,
  },
  {
    id: 'story-204',
    title: 'Mystery of the Midnight Bloom',
    genre: '🕵️ Mystery',
    mood: 'Suspenseful',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
    summary: 'Every midnight, a rare night-blooming cereus emits a golden fragrance that attracts an unidentified nocturnal pollinator.',
    narrative: `Professor Kulkarni adjusted his infrared night camera. The clock struck 12:00 AM. 

Slowly, white velvety petals unfurled under the full moon, releasing a sweet vanilla scent that carried across the botanical garden...`,
    isInteractive: true,
    choices: [
      {
        id: 'c3',
        text: '🌙 Focus infrared lens on the upper canopy branches',
        nextText: `The thermal sensors flashed red. A rare Sphinx Moth with a 10-inch proboscis descended silently onto the blossom...`,
      },
      {
        id: 'c4',
        text: '🔍 Inspect damp soil around root nodules',
        nextText: `Glowing root exudates were attracting subterranean beetles that pollinated the lowest stamens from below...`,
      },
    ],
    reactions: { magical: 38, lovedIt: 29, unexpected: 41, funny: 3, thoughtful: 22 },
    isFeatured: false,
    progress: 0,
  }
];

export default function Stories() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = STORIES_TRANSLATIONS[lang] || STORIES_TRANSLATIONS.en;

  // Persistent Stories State
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_stories_v1');
      return saved ? JSON.parse(saved) : SEED_STORIES;
    } catch {
      return SEED_STORIES;
    }
  });

  const [savedStoryIds, setSavedStoryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_stories_saved_v1');
      return saved ? JSON.parse(saved) : ['story-201', 'story-203'];
    } catch {
      return ['story-201', 'story-203'];
    }
  });

  // Filter & Active Reader States
  const [activeTab, setActiveTab] = useState('all'); // all, my_stories, favorites, interactive
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingStory, setReadingStory] = useState(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantMode, setAIAssistantMode] = useState('');

  // 3D Card Hover Tracking state
  const [flippedCardId, setFlippedCardId] = useState(null);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('✨ Fantasy');
  const [newMood, setNewMood] = useState('Mystical');
  const [newPrompt, setNewPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('pulse_stories_v1', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('pulse_stories_saved_v1', JSON.stringify(savedStoryIds));
  }, [savedStoryIds]);

  // Reaction Handler
  const handleReaction = (storyId, rxKey) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const currentCount = s.reactions?.[rxKey] || 0;
        return {
          ...s,
          reactions: { ...s.reactions, [rxKey]: currentCount + 1 },
        };
      })
    );
  };

  // Toggle Bookmark
  const toggleSaveStory = (storyId) => {
    setSavedStoryIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  // Create Story Submit
  const handleCreateStory = (e) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      const generated = {
        id: `story-${Date.now()}`,
        title: newTitle.trim() || 'The Crystal Canopy Discovery',
        genre: newGenre,
        mood: newMood,
        readTime: '4 min read',
        coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
        summary: `AI generated narrative based on: "${newPrompt.slice(0, 80)}…"`,
        narrative: `In a quiet sanctuary hidden behind misty canopy ridges, an unusual ecological pattern began to unfold...

${newPrompt}

As night settled over the grove, bioluminescent spores drifted softly upon ambient breezes, connecting distant roots in a silent dance of light.`,
        isInteractive: true,
        choices: [
          {
            id: 'gen-c1',
            text: '🌟 Follow the glowing spore trail deeper into the ancient grove',
            nextText: 'The spore trail led to a hidden waterfalls where ancient petroglyphs illuminated under starlight...',
          },
          {
            id: 'gen-c2',
            text: '🔬 Collect leaf sample for neural pattern analysis',
            nextText: 'The scanner revealed intricate fractal veins storing century-old environmental memory...',
          },
        ],
        reactions: { magical: 1, lovedIt: 2, unexpected: 1, funny: 0, thoughtful: 3 },
        isFeatured: false,
        progress: 0,
      };

      setStories([generated, ...stories]);
      setIsGenerating(false);
      setShowCreateModal(false);
      setNewTitle('');
      setNewPrompt('');
      setReadingStory(generated);
    }, 1800);
  };

  // AI Assistant Actions
  const applyAIAssistant = (actionType) => {
    if (!readingStory) return;
    setAIAssistantMode(actionType);

    setTimeout(() => {
      let appendedText = '';
      if (actionType === 'rewrite') {
        appendedText = '\n\n[AI Rewrite]: The ambient flora glowed with heightened emerald vibrancy as gentle rains refreshed the ancient canopy.';
      } else if (actionType === 'mood') {
        appendedText = '\n\n[Atmospheric Shift]: A mysterious low frequency hum vibrated through subterranean roots as dusk turned to starry midnight.';
      } else if (actionType === 'ending') {
        appendedText = '\n\n[Alternate Ending]: Realizing the sanctuary was self-aware, Maya chose to guard its secrets, becoming the grove’s permanent keeper.';
      } else if (actionType === 'translate') {
        appendedText = '\n\n[Translated Section]: ઇકોલોજીકલ વાર્તાનું આ પ્રકરણ પ્રકૃતિના અદ્રશ્ય ધબકારાને દર્શાવે છે.';
      }

      setReadingStory((prev) => ({
        ...prev,
        narrative: prev.narrative + appendedText,
      }));
      setAIAssistantMode('');
    }, 1200);
  };

  // Filtered Stories Computation
  const featuredStory = stories.find((s) => s.isFeatured) || stories[0];

  const filteredStories = stories.filter((s) => {
    // Genre filter
    if (selectedGenre !== 'All' && s.genre !== selectedGenre) return false;
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.summary.toLowerCase().includes(q);
      const matchGenre = s.genre.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchGenre) return false;
    }
    // Tab filter
    if (activeTab === 'favorites') {
      return savedStoryIds.includes(s.id);
    }
    if (activeTab === 'interactive') {
      return s.isInteractive;
    }
    if (activeTab === 'my_stories') {
      return s.id.startsWith('story-1') || s.id.startsWith('story-Date');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#061009] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      {/* Starry Atmospheric Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#4ADE80] animate-ping"
            style={{
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              left: `${(i * 17) % 95}%`,
              top: `${(i * 13) % 95}%`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* ──────────────── IMMERSIVE STORY READER MODAL ──────────────── */}
      <AnimatePresence>
        {readingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#061009]/95 backdrop-blur-2xl overflow-y-auto flex flex-col justify-between"
          >
            {/* Top Reader Navigation Bar */}
            <div className="sticky top-0 z-20 bg-[#0A180F]/90 border-b border-[#20452F] px-6 py-4 flex items-center justify-between backdrop-blur-xl">
              <button
                onClick={() => {
                  setReadingStory(null);
                  setSelectedChoiceIndex(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#13271C] border border-[#20422E] text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#4ADE80]" />
                <span>Exit Reader</span>
              </button>

              <div className="text-center hidden sm:block">
                <p className="text-xs uppercase tracking-wider text-[#4ADE80] font-semibold">{readingStory.genre}</p>
                <h3 className="font-display text-base font-bold text-white truncate max-w-xs">{readingStory.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAIAssistant((v) => !v)}
                  className="px-3.5 py-2 rounded-full bg-[#1A3827] border border-[#4ADE80]/50 text-xs font-semibold text-[#4ADE80] flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Story Assistant</span>
                </button>

                <button
                  onClick={() => toggleSaveStory(readingStory.id)}
                  className={`p-2 rounded-full border cursor-pointer ${
                    savedStoryIds.includes(readingStory.id)
                      ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]'
                      : 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white'
                  }`}
                  title="Save Story"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Assistant Side Dropdown */}
            <AnimatePresence>
              {showAIAssistant && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-md mx-auto my-3 p-4 bg-[#112318] border border-[#4ADE80]/40 rounded-3xl shadow-2xl space-y-3 z-30"
                >
                  <div className="flex justify-between items-center border-b border-[#20452F] pb-2">
                    <p className="text-xs font-bold text-[#4ADE80] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> {t.aiAssistantTitle}
                    </p>
                    <button onClick={() => setShowAIAssistant(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <button
                      onClick={() => applyAIAssistant('rewrite')}
                      className="p-2.5 rounded-xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] cursor-pointer text-left"
                    >
                      {t.rewriteSection}
                    </button>
                    <button
                      onClick={() => applyAIAssistant('mood')}
                      className="p-2.5 rounded-xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] cursor-pointer text-left"
                    >
                      {t.changeMood}
                    </button>
                    <button
                      onClick={() => applyAIAssistant('ending')}
                      className="p-2.5 rounded-xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] cursor-pointer text-left"
                    >
                      {t.alternateEnding}
                    </button>
                    <button
                      onClick={() => applyAIAssistant('translate')}
                      className="p-2.5 rounded-xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] cursor-pointer text-left"
                    >
                      {t.translateStory}
                    </button>
                  </div>

                  {aiAssistantMode && (
                    <div className="text-center py-2 text-xs text-[#4ADE80] animate-pulse">
                      ✨ AI Assistant is enhancing story narrative…
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Reader Content */}
            <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 flex-1">
              <div className="space-y-3 text-center">
                <span className="px-3.5 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                  {readingStory.genre} · {readingStory.mood}
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {readingStory.title}
                </h1>
                <p className="text-xs text-slate-400">{readingStory.readTime}</p>
              </div>

              {readingStory.coverImage && (
                <img
                  src={readingStory.coverImage}
                  alt={readingStory.title}
                  className="w-full h-72 object-cover rounded-3xl border border-[#20452F] shadow-2xl"
                />
              )}

              {/* Story Narrative Text */}
              <div className="prose prose-invert max-w-none text-base sm:text-lg leading-relaxed text-slate-200 font-normal whitespace-pre-line space-y-4">
                {readingStory.narrative}
              </div>

              {/* Interactive Choice Branching Section */}
              {readingStory.isInteractive && readingStory.choices && (
                <div className="bg-[#112318] border border-[#4ADE80]/40 p-6 rounded-3xl space-y-4 shadow-xl">
                  <p className="text-sm font-bold text-[#4ADE80] uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4" /> {t.choicePrompt}
                  </p>

                  <div className="space-y-2.5">
                    {readingStory.choices.map((choice, idx) => (
                      <button
                        key={choice.id}
                        onClick={() => setSelectedChoiceIndex(idx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          selectedChoiceIndex === idx
                            ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                            : 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                        }`}
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>

                  {/* Render Next Path Outcome */}
                  {selectedChoiceIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0E2015] border border-[#20422E] p-4 rounded-2xl text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed mt-3"
                    >
                      <p className="font-semibold text-[#4ADE80] mb-1">🌿 Chosen Branch Outcome:</p>
                      <p>{readingStory.choices[selectedChoiceIndex].nextText}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Reader Reactions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#20452F]">
                <span className="text-xs text-slate-400">Reactions</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'magical', label: t.magical, icon: '✨' },
                    { key: 'lovedIt', label: t.lovedIt, icon: '❤️' },
                    { key: 'unexpected', label: t.unexpected, icon: '😮' },
                    { key: 'funny', label: t.funny, icon: '😂' },
                    { key: 'thoughtful', label: t.thoughtful, icon: '🧠' },
                  ].map((rx) => (
                    <button
                      key={rx.key}
                      onClick={() => handleReaction(readingStory.id, rx.key)}
                      className="px-3 py-1.5 rounded-full bg-[#13271C] border border-[#20422E] text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                    >
                      <span>{rx.icon}</span> <span>{readingStory.reactions?.[rx.key] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── CREATE STORY MODAL ──────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-3">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#4ADE80]" />
                  <span>{t.createModalTitle}</span>
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    {t.promptLabel}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="e.g., A girl discovers glowing spores in an ancient cedar forest that respond to birdsong..."
                    className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl p-3.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      {t.titleLabel}
                    </label>
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Story Title"
                      className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      {t.genreLabel}
                    </label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                    >
                      <option value="✨ Fantasy">{t.genreFantasy}</option>
                      <option value="🚀 Sci-Fi">{t.genreSciFi}</option>
                      <option value="🌿 Nature & Eco">{t.genreNature}</option>
                      <option value="🕵️ Mystery">{t.genreMystery}</option>
                      <option value="🌍 Adventure">{t.genreAdventure}</option>
                      <option value="📚 Educational">{t.genreEdu}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? t.generatingText : t.generateBtn}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                {t.heroTag}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Wand2 className="w-4 h-4" />
              <span>{t.createStoryBtn}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── FEATURED STORY BANNER ──────────────── */}
        {featuredStory && (
          <div className="relative bg-[#112318]/90 border border-[#4ADE80]/40 rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2 gap-0 backdrop-blur-xl">
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img
                src={featuredStory.coverImage}
                alt={featuredStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#112318] via-transparent to-transparent md:bg-gradient-to-r" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-[#4ADE80] border border-[#4ADE80]/40 text-xs font-bold uppercase backdrop-blur-md">
                ⭐ Featured Story
              </span>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-[#4ADE80] font-semibold uppercase tracking-wider">
                  {featuredStory.genre} · {featuredStory.readTime}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {featuredStory.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {featuredStory.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setReadingStory(featuredStory)}
                  className="px-5 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.readStory}</span>
                </button>

                {featuredStory.isInteractive && (
                  <button
                    onClick={() => setReadingStory(featuredStory)}
                    className="px-4 py-2.5 rounded-full bg-[#1A3827] border border-[#4ADE80]/50 text-[#4ADE80] font-semibold text-xs hover:bg-[#234B34] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t.interactiveMode}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── CATEGORY & FILTER TABS ──────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories by title, genre, or keyword…"
                className="w-full bg-[#12241A] border border-[#234A33] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4ADE80]"
              />
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
            {[
              { id: 'all', label: t.tabAll },
              { id: 'favorites', label: t.tabFavorites },
              { id: 'interactive', label: t.tabInteractive },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                    : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              t.genreAll,
              t.genreFantasy,
              t.genreSciFi,
              t.genreNature,
              t.genreMystery,
              t.genreAdventure,
              t.genreEdu,
            ].map((genreName, idx) => {
              const val = idx === 0 ? 'All' : [
                '✨ Fantasy', '🚀 Sci-Fi', '🌿 Nature & Eco', '🕵️ Mystery', '🌍 Adventure', '📚 Educational'
              ][idx - 1];
              return (
                <button
                  key={genreName}
                  onClick={() => setSelectedGenre(val)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGenre === val
                      ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                      : 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {genreName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────── 3D FLIPPING STORY CARDS GRID ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const isFlipped = flippedCardId === story.id;
            const isSaved = savedStoryIds.includes(story.id);

            return (
              <div
                key={story.id}
                className="perspective-1000 h-96 group cursor-pointer"
                onMouseEnter={() => setFlippedCardId(story.id)}
                onMouseLeave={() => setFlippedCardId(null)}
                onClick={() => setReadingStory(story)}
              >
                <motion.div
                  className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 backface-hidden bg-[#112318] border border-[#20452F] rounded-3xl overflow-hidden flex flex-col justify-between p-5">
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-[#20422E] mb-3">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-[#4ADE80] border border-[#4ADE80]/30 text-[10px] font-bold uppercase backdrop-blur-xs">
                        {story.genre}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-white line-clamp-1 group-hover:text-[#4ADE80] transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-snug">
                          {story.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#20452F] text-[11px] text-slate-400">
                        <span>{story.readTime}</span>
                        <span className="text-[#4ADE80] font-semibold flex items-center gap-1">
                          Flip 3D <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0E2015] border border-[#4ADE80]/50 rounded-3xl p-5 flex flex-col justify-between text-slate-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#20422E] pb-2">
                        <span className="text-xs font-bold text-[#4ADE80]">{story.genre}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveStory(story.id);
                          }}
                          className={`p-1.5 rounded-full border ${
                            isSaved ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]' : 'border-[#20422E] text-slate-400'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-display text-base font-bold text-white">{story.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{story.summary}"
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadingStory(story);
                        }}
                        className="w-full py-2.5 rounded-2xl bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Read Story Now</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
