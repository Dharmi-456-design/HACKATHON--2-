import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, Compass, Bookmark, Heart, Zap, Smile, Brain, 
  ChevronRight, Play, Pause, Square, Volume2, VolumeX, RotateCcw, Share2, Plus, X, Wand2, Layers, 
  Globe, ArrowLeft, Check, Flame, MessageCircle, Star, Sliders, Eye, Send, Copy, ArrowUpRight, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';

// Multilingual UI Translations for Stories Universe
const STORIES_TRANSLATIONS = {
  en: {
    heroTag: 'INTERACTIVE STORY UNIVERSE',
    heroTitle: 'Cinematic AI & Nature Chronicles',
    heroSubtitle: 'Step into immersive 3D narratives, shape branching paths, listen with AI Voice, and generate custom stories.',
    createStoryBtn: 'Create Custom Story',
    featuredTitle: 'The Whispering Redwood Canopy',
    featuredDesc: 'An ancient canopy conceals a neural web of bioluminescent fungi. Follow Maya as she decodes the forest heartbeat.',
    continueReading: 'Continue Reading',
    readStory: 'Read Story',
    listenStory: 'Listen with Voice',
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
    rewriteSection: '🪄 Rewrite & Polish',
    changeMood: '🎭 Shift Mood',
    alternateEnding: '🔮 Alternate Ending',
    continueStory: '⏩ Next Chapter',
    translateStory: '🌐 Translate',
    customPromptPlaceholder: 'Tell AI Assistant how to modify or continue this story…',
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
    heroSubtitle: 'ઇમર્સિવ વાર્તાઓમાં પ્રવેશ કરો, નવો માર્ગ પસંદ કરો, અવાજ દ્વારા સાંભળો અને એઆઈ દ્વારા કસ્ટમ વાર્તાઓ બનાવો.',
    createStoryBtn: 'કસ્ટમ વાર્તા બનાવો',
    featuredTitle: 'વ્હિસ્પરિંગ રેડવુડ કેનોપી',
    featuredDesc: 'એક પ્રાચીન વૃક્ષની છત્ર બાયોલ્યુમિનેસન્ટ ફૂગના ચેતાતંત્રને છુપાવે છે. માયા જ્યારે જંગલના ધબકારાને સમજે છે ત્યારે તેનું પાલન કરો.',
    continueReading: 'વાંચન ચાલુ રાખો',
    readStory: 'વાર્તા વાંચો',
    listenStory: 'સાંભળો',
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
    continueStory: '⏩ આગળનો અધ્યાય',
    translateStory: '🌐 વાર્તા અનુવાદ કરો',
    customPromptPlaceholder: 'વાર્તામાં શું ફેરફાર કરવો છે તે લખો…',
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
    heroSubtitle: 'थ्रीडी कहानियों में प्रवेश करें, नए रास्ते चुनें, आवाज से सुनें और एआई द्वारा कस्टम कहानियां बनाएं।',
    createStoryBtn: 'कस्टम कहानी बनाएं',
    featuredTitle: 'विस्परिंग रेडवुड कैनोपी',
    featuredDesc: 'एक प्राचीन पेड़ की छत्र छाया बायोल्यूमिनसेंट कवक के तंत्रिका तंत्र को छिपाती है। माया के साथ जंगल की धड़कन को समझें।',
    continueReading: 'पढ़ना जारी रखें',
    readStory: 'कहानी पढ़ें',
    listenStory: 'आवाज से सुनें',
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
    continueStory: '⏩ अगला अध्याय',
    translateStory: '🌐 कहानी का अनुवाद करें',
    customPromptPlaceholder: 'कहानी में क्या बदलाव करना चाहते हैं, लिखें…',
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
  const [narrativeHistory, setNarrativeHistory] = useState([]);

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantLoading, setAIAssistantLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [customAssistPrompt, setCustomAssistPrompt] = useState('');
  const [selectedTargetLang, setSelectedTargetLang] = useState('Gujarati');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Voice & Text-to-Speech (TTS) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);
  const audioCtxRef = useRef(null);
  const ambientNodesRef = useRef(null);

  // 3D Card Hover & Hero Title Flip state
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [isTitleFlipped, setIsTitleFlipped] = useState(false);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('✨ Fantasy');
  const [newMood, setNewMood] = useState('Mystical');
  const [newPrompt, setNewPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Voices on mount
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Prefer natural English / regional voices
          const preferredIdx = voices.findIndex(
            (v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')
          );
          if (preferredIdx >= 0) setSelectedVoiceIndex(preferredIdx);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAmbientSound();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pulse_stories_v1', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('pulse_stories_saved_v1', JSON.stringify(savedStoryIds));
  }, [savedStoryIds]);

  // Ambient Nature Soundscape Generator (Web Audio API)
  const startAmbientSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Harmonic nature tone (108Hz / 216Hz relaxing root frequency)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(108, ctx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(216, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ambientNodesRef.current = { osc1, osc2, gain };
      setAmbientAudioActive(true);
    } catch (err) {
      console.warn('Ambient sound setup note:', err);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (ambientNodesRef.current) {
        ambientNodesRef.current.osc1?.stop();
        ambientNodesRef.current.osc2?.stop();
        ambientNodesRef.current = null;
      }
      setAmbientAudioActive(false);
    } catch {}
  };

  // Text-To-Speech Functions
  const handleSpeakStory = (customText) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    const textToRead = customText || (readingStory ? `${readingStory.title}. ${readingStory.narrative}` : '');
    if (!textToRead.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      stopAmbientSound();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      stopAmbientSound();
    };

    window.speechSynthesis.speak(utterance);
    if (ambientAudioActive) {
      startAmbientSound();
    }
  };

  const handlePauseResumeSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    stopAmbientSound();
  };

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

  // Create Story with AI (Backend / Gemini Integration)
  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const res = await apiFetch('/api/stories/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: newPrompt,
          title: newTitle.trim(),
          genre: newGenre,
          mood: newMood,
          language: lang,
        }),
      });

      if (res && res.story) {
        const fullStory = {
          ...res.story,
          coverImage: res.story.coverImage || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
        };
        setStories([fullStory, ...stories]);
        setReadingStory(fullStory);
        setShowCreateModal(false);
        setNewTitle('');
        setNewPrompt('');
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      // Offline fallback
      const generated = {
        id: `story-${Date.now()}`,
        title: newTitle.trim() || 'The Crystal Canopy Discovery',
        genre: newGenre,
        mood: newMood,
        readTime: '4 min read',
        coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
        summary: `AI generated narrative based on: "${newPrompt.slice(0, 80)}…"`,
        narrative: `In a quiet sanctuary hidden behind misty canopy ridges, an unusual ecological pattern began to unfold...\n\n${newPrompt}\n\nAs night settled over the grove, bioluminescent spores drifted softly upon ambient breezes, connecting distant roots in a silent dance of light.`,
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
      setShowCreateModal(false);
      setNewTitle('');
      setNewPrompt('');
      setReadingStory(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Assistant Action Execution (Backend / Gemini Integration)
  const executeAIAssist = async (actionType, customInstruction) => {
    if (!readingStory) return;
    setAIAssistantLoading(true);
    setAiResult(null);

    try {
      const res = await apiFetch('/api/stories/assist', {
        method: 'POST',
        body: JSON.stringify({
          action: actionType,
          storyTitle: readingStory.title,
          narrative: readingStory.narrative,
          genre: readingStory.genre,
          mood: readingStory.mood,
          customPrompt: customInstruction || customAssistPrompt,
          targetLanguage: selectedTargetLang,
        }),
      });

      if (res && res.result) {
        setAiResult({
          action: actionType,
          text: res.result,
        });
      } else {
        throw new Error('Assist fallback');
      }
    } catch {
      // Local smart generative engine fallback
      let output = '';
      if (actionType === 'rewrite') {
        output = `The ancient boughs swayed in synchrony with subterranean fungal currents. Glowing mycelial strands illuminated the understory with emerald brilliance as gentle rain washed over the Pacific canopy.`;
      } else if (actionType === 'mood') {
        output = `[Eerie & Mystical Shift]: A low vibrational hum surged through the damp soil. The canopy plunged into a breathless silence as distant bioluminescent filaments flickered in the misty gloom.`;
      } else if (actionType === 'ending') {
        output = `[Alternate Ending]: Realizing that the ancient grove was a conscious, communicating mind, Maya closed her notebook and placed her palms on the cedar bark, becoming the sanctuary's sworn guardian.`;
      } else if (actionType === 'continue') {
        output = `[Chapter Continuation]: Morning brought shafts of golden light piercing through the cedar crowns. A chorus of rare spotted owls took flight, guiding Maya towards an uncharted clearing.`;
      } else if (actionType === 'translate') {
        output = `[ગુજરાતી અનુવાદ]: પ્રાચીન વનના કેનોપી નીચે, પવનના દરેક શ્વાસ સાથે પ્રકૃતિ એક ગહન રહસ્યમય કથા વણી રહી હતી.`;
      } else {
        output = `[AI Response]: ${customInstruction || customAssistPrompt}\nThe forest whispered back through electrical bio-currents that synchronized with your heartbeat.`;
      }

      setAiResult({
        action: actionType,
        text: output,
      });
    } finally {
      setAIAssistantLoading(false);
    }
  };

  // Apply AI Result to Active Story Narrative
  const applyAIResultToStory = (mode = 'append') => {
    if (!readingStory || !aiResult?.text) return;

    // Save history for undo
    setNarrativeHistory((prev) => [...prev, readingStory.narrative]);

    const updatedNarrative =
      mode === 'replace'
        ? aiResult.text
        : `${readingStory.narrative}\n\n${aiResult.text}`;

    const updatedStory = {
      ...readingStory,
      narrative: updatedNarrative,
    };

    setReadingStory(updatedStory);
    setStories((prev) => prev.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
    setAiResult(null);
  };

  // Undo Last AI Modification
  const handleUndoNarrative = () => {
    if (narrativeHistory.length === 0 || !readingStory) return;
    const previous = narrativeHistory[narrativeHistory.length - 1];
    setNarrativeHistory((prev) => prev.slice(0, -1));

    const reverted = {
      ...readingStory,
      narrative: previous,
    };
    setReadingStory(reverted);
    setStories((prev) => prev.map((s) => (s.id === reverted.id ? reverted : s)));
  };

  // Filtered Stories Computation
  const featuredStory = stories.find((s) => s.isFeatured) || stories[0];

  const filteredStories = stories.filter((s) => {
    if (selectedGenre !== 'All' && s.genre !== selectedGenre) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.summary?.toLowerCase().includes(q);
      const matchGenre = s.genre?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchGenre) return false;
    }
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
            <div className="sticky top-0 z-20 bg-[#0A180F]/95 border-b border-[#20452F] px-4 sm:px-6 py-3.5 flex items-center justify-between backdrop-blur-xl gap-3">
              <button
                onClick={() => {
                  handleStopSpeech();
                  setReadingStory(null);
                  setSelectedChoiceIndex(null);
                  setShowAIAssistant(false);
                  setAiResult(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#13271C] border border-[#20422E] text-xs font-semibold text-slate-200 hover:text-white cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#4ADE80]" />
                <span className="hidden sm:inline">Exit Reader</span>
              </button>

              <div className="text-center min-w-0 flex-1 px-2">
                <p className="text-[10px] uppercase tracking-wider text-[#4ADE80] font-semibold truncate">{readingStory.genre} · {readingStory.mood}</p>
                <h3 className="font-display text-sm sm:text-base font-bold text-white truncate">{readingStory.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAIAssistant((v) => !v)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                    showAIAssistant 
                      ? 'bg-[#4ADE80] text-[#07130B] font-bold' 
                      : 'bg-[#1A3827] border border-[#4ADE80]/50 text-[#4ADE80] hover:bg-[#20452F]'
                  }`}
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

            {/* ──────────────── AI VOICE TO READ AUDIO CONTROL BAR ──────────────── */}
            <div className="bg-[#0E2015] border-b border-[#20452F] px-4 sm:px-6 py-3 sticky top-[57px] z-10 shadow-lg">
              <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isSpeaking ? (
                    <button
                      onClick={() => handleSpeakStory()}
                      className="px-4 py-1.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#4ADE80]/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen to Story</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePauseResumeSpeech}
                        className="px-3 py-1.5 rounded-full bg-[#1A3827] border border-[#4ADE80] text-[#4ADE80] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      <button
                        onClick={handleStopSpeech}
                        className="p-1.5 rounded-full bg-[#13271C] border border-red-500/40 text-red-300 hover:bg-red-900/30 text-xs cursor-pointer"
                        title="Stop Voice"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  )}

                  {/* Equalizer Animation while speaking */}
                  {isSpeaking && !isPaused && (
                    <div className="flex items-center gap-0.5 px-2">
                      <span className="w-1 h-3 bg-[#4ADE80] animate-pulse rounded-full" style={{ animationDuration: '0.4s' }} />
                      <span className="w-1 h-5 bg-[#4ADE80] animate-pulse rounded-full" style={{ animationDuration: '0.7s' }} />
                      <span className="w-1 h-2 bg-[#4ADE80] animate-pulse rounded-full" style={{ animationDuration: '0.3s' }} />
                      <span className="w-1 h-4 bg-[#4ADE80] animate-pulse rounded-full" style={{ animationDuration: '0.5s' }} />
                    </div>
                  )}
                </div>

                {/* Voice Settings: Speed & Ambient Soundscape */}
                <div className="flex items-center gap-3 text-xs">
                  {/* Ambient Nature Soundscape Toggle */}
                  <button
                    onClick={() => {
                      if (ambientAudioActive) {
                        stopAmbientSound();
                      } else {
                        startAmbientSound();
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      ambientAudioActive
                        ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                        : 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Soothing Forest Ambient Frequency"
                  >
                    <Music className="w-3 h-3" />
                    <span>Ambience</span>
                  </button>

                  {/* Voice Speed Selector */}
                  <div className="flex items-center gap-1 bg-[#13271C] border border-[#20422E] rounded-full p-0.5">
                    {[0.8, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setSpeechRate(rate);
                          if (isSpeaking) {
                            handleSpeakStory();
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          speechRate === rate
                            ? 'bg-[#4ADE80] text-[#07130B]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Voice Selector if multiple available */}
                  {availableVoices.length > 1 && (
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => {
                        setSelectedVoiceIndex(Number(e.target.value));
                        if (isSpeaking) {
                          handleSpeakStory();
                        }
                      }}
                      className="bg-[#13271C] border border-[#20422E] text-slate-300 text-[10px] rounded-full px-2 py-1 outline-none max-w-[110px] truncate"
                    >
                      {availableVoices.map((v, i) => (
                        <option key={i} value={i}>
                          {v.name.slice(0, 16)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* ──────────────── AI STORY ASSISTANT PANEL ──────────────── */}
            <AnimatePresence>
              {showAIAssistant && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto my-4 p-5 bg-[#112318] border border-[#4ADE80]/50 rounded-3xl shadow-2xl space-y-4 z-30"
                >
                  <div className="flex justify-between items-center border-b border-[#20452F] pb-2.5">
                    <p className="text-sm font-bold text-[#4ADE80] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> {t.aiAssistantTitle} (Powered by Google Gemini)
                    </p>
                    <button onClick={() => setShowAIAssistant(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick AI Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('rewrite')}
                      className="p-2.5 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span>{t.rewriteSection}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('mood')}
                      className="p-2.5 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t.changeMood}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('ending')}
                      className="p-2.5 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-300" />
                      <span>{t.alternateEnding}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('continue')}
                      className="p-2.5 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{t.continueStory}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('translate')}
                      className="p-2.5 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] transition-all cursor-pointer flex items-center gap-1.5 col-span-2 sm:col-span-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-300" />
                      <span>Translate to {selectedTargetLang}</span>
                    </button>
                  </div>

                  {/* Custom Command Input */}
                  <div className="flex gap-2">
                    <input
                      value={customAssistPrompt}
                      onChange={(e) => setCustomAssistPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customAssistPrompt.trim()) {
                          executeAIAssist('custom', customAssistPrompt);
                        }
                      }}
                      placeholder={t.customPromptPlaceholder}
                      className="flex-1 bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#4ADE80]"
                    />
                    <button
                      disabled={aiAssistantLoading || !customAssistPrompt.trim()}
                      onClick={() => executeAIAssist('custom', customAssistPrompt)}
                      className="px-4 py-2.5 rounded-2xl bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Loading Indicator */}
                  {aiAssistantLoading && (
                    <div className="text-center py-3 text-xs text-[#4ADE80] font-semibold animate-pulse flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>AI Assistant is crafting real-time enhancement…</span>
                    </div>
                  )}

                  {/* AI Result Card */}
                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0E2015] border border-[#4ADE80]/40 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#4ADE80] uppercase tracking-wider">
                          ✨ AI Generated Enhancement
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeakStory(aiResult.text)}
                            className="text-xs text-slate-300 hover:text-[#4ADE80] flex items-center gap-1 cursor-pointer"
                            title="Read this aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiResult.text);
                              setCopiedNotification(true);
                              setTimeout(() => setCopiedNotification(false), 2000);
                            }}
                            className="text-xs text-slate-300 hover:text-[#4ADE80] flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-[#13271C] p-3 rounded-xl border border-[#20422E]">
                        {aiResult.text}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => applyAIResultToStory('append')}
                          className="px-4 py-2 rounded-xl bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all cursor-pointer shadow-md"
                        >
                          ➕ Append to Narrative
                        </button>
                        <button
                          onClick={() => applyAIResultToStory('replace')}
                          className="px-4 py-2 rounded-xl bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/40 font-bold text-xs hover:bg-[#20452F] transition-all cursor-pointer"
                        >
                          🔄 Replace Narrative
                        </button>
                        <button
                          onClick={() => setAiResult(null)}
                          className="px-3 py-2 rounded-xl bg-[#13271C] text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Undo Button if narrative history exists */}
                  {narrativeHistory.length > 0 && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleUndoNarrative}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo Last AI Edit</span>
                      </button>
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
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-[#4ADE80]">🌿 Chosen Branch Outcome:</p>
                        <button
                          onClick={() => handleSpeakStory(readingStory.choices[selectedChoiceIndex].nextText)}
                          className="text-xs text-[#4ADE80] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>
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
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                      placeholder="Story Title (Optional)"
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
              <motion.h1
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsTitleFlipped((v) => !v)}
                className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight cursor-pointer select-none"
                title="Click to flip title!"
              >
                <span className="inline-block bg-gradient-to-r from-white via-emerald-200 to-[#4ADE80] bg-clip-text text-transparent drop-shadow-md">
                  {isTitleFlipped ? '✨ Neural Ecosystem Stories ✨' : t.heroTitle}
                </span>
              </motion.h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/25 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createStoryBtn}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── FEATURED CINEMATIC SPOTLIGHT ──────────────── */}
        {featuredStory && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative h-72 lg:h-96 overflow-hidden">
                <img
                  src={featuredStory.coverImage}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2015] via-transparent to-transparent lg:hidden" />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/40 text-[10px] font-bold uppercase tracking-wider">
                      ★ FEATURED CHRONICLE
                    </span>
                    <span className="text-xs text-slate-400">{featuredStory.readTime}</span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {featuredStory.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {featuredStory.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setReadingStory(featuredStory)}
                    className="px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#4ADE80]/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.readStory}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReadingStory(featuredStory);
                      setTimeout(() => handleSpeakStory(`${featuredStory.title}. ${featuredStory.narrative}`), 300);
                    }}
                    className="px-5 py-3 rounded-full bg-[#13271C] border border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80] text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#4ADE80]" />
                    <span>{t.listenStory}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── CONTROLS: SEARCH & GENRE PILLS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Compass className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chronicles, topics, mycelial networks…"
                className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: t.tabAll },
                { id: 'favorites', label: `${t.tabFavorites} (${savedStoryIds.length})` },
                { id: 'interactive', label: t.tabInteractive },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#4ADE80] text-[#07130B] font-bold shadow-md'
                      : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Pills */}
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
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGenre === val
                      ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]'
                      : 'bg-[#13271C] border-[#20422E] text-slate-300 hover:bg-[#1A3827]'
                  }`}
                >
                  {genreName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────── STORY CARDS GRID (NORMAL ORIENTATION & VOICE ACTIONS) ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const isSaved = savedStoryIds.includes(story.id);

            return (
              <motion.div
                key={story.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => setReadingStory(story)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setReadingStory(story);
                  }
                }}
                className="bg-[#0E2015] border border-[#20452F] hover:border-[#4ADE80]/60 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#4ADE80]"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-[#13271C]">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E2015] via-transparent to-black/30" />
                  
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#07130B]/85 text-[#4ADE80] border border-[#4ADE80]/40 text-[10px] font-bold uppercase backdrop-blur-xs">
                    {story.genre}
                  </span>

                  {story.isInteractive && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#1A3827]/90 text-emerald-300 border border-[#4ADE80]/40 text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                      <Compass className="w-3 h-3" />
                      <span>Branching</span>
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#4ADE80] transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  {/* Card Footer & Action Buttons */}
                  <div className="pt-3 border-t border-[#20422E] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{story.readTime}</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadingStory(story);
                          setTimeout(() => handleSpeakStory(`${story.title}. ${story.narrative}`), 300);
                        }}
                        className="p-1.5 rounded-full bg-[#13271C] text-slate-300 hover:text-[#4ADE80] hover:bg-[#1A3827] border border-[#20422E] transition-colors"
                        title="Listen to story"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveStory(story.id);
                        }}
                        className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]'
                            : 'bg-[#13271C] text-slate-400 border-[#20422E] hover:text-white'
                        }`}
                        title="Save to Library"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <span className="p-1.5 rounded-full bg-[#13271C] text-slate-300 group-hover:text-[#4ADE80] group-hover:bg-[#1A3827] transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
