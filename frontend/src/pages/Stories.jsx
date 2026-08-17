import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, Compass, Bookmark, Heart, Zap, Smile, Brain, 
  ChevronRight, Play, Pause, Square, Volume2, VolumeX, RotateCcw, Share2, Plus, X, Wand2, Layers, 
  Globe, ArrowLeft, Check, Flame, MessageCircle, Star, Sliders, Eye, Send, Copy, ArrowUpRight, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { DEFAULT_STORIES } from '../data/storiesData';

// Multilingual UI Translations for Stories Universe
const STORIES_TRANSLATIONS = {
  en: {
    heroTag: 'Interactive Story Universe',
    heroTitle: 'Living Nature Chronicles & Speculative Ecology',
    heroSubtitle: 'Step into immersive ecological narratives, explore branching field decisions, and listen with real-time text-to-speech.',
    createStoryBtn: 'Create New Story',
    featuredTitle: 'The Whispering Redwood Canopy',
    featuredDesc: 'An ancient canopy conceals an underground communication network of symbiotic fungi. Follow Maya as she decodes the bioacoustic rhythms.',
    continueReading: 'Continue Reading',
    readStory: 'Read Story',
    listenStory: 'Listen with Voice',
    interactiveMode: 'Interactive Branching Path',
    tabAll: 'Explore Universe',
    tabMyStories: 'My Library',
    tabFavorites: 'Saved Stories',
    tabInteractive: 'Branching Paths',
    genreAll: 'All Categories',
    genreNature: 'Nature & Ecology',
    genreSciFi: 'Speculative Ecology',
    genreMarine: 'Marine Biology',
    genreBotany: 'Botanical Fieldwork',
    genreExpedition: 'Canopy Expedition',
    genreScience: 'Ecological Science',
    genreHabitats: 'Regenerative Habitats',
    genreHeritage: 'Folklore & Heritage',
    createModalTitle: 'Generate an Ecological Story',
    promptLabel: 'Story Prompt or Field Concept',
    titleLabel: 'Story Title',
    genreLabel: 'Category',
    moodLabel: 'Atmospheric Mood',
    generateBtn: 'Generate Story with AI',
    generatingText: 'Synthesizing narrative threads…',
    aiAssistantTitle: 'Story Assistant',
    rewriteSection: 'Rewrite & Polish',
    changeMood: 'Shift Atmosphere',
    alternateEnding: 'Alternate Outcome',
    continueStory: 'Next Chapter',
    translateStory: 'Translate',
    customPromptPlaceholder: 'Instruct the assistant to expand or modify this chronicle…',
    choicePrompt: 'Choose your field decision:',
    magical: 'Inspiring',
    lovedIt: 'Captivating',
    unexpected: 'Unexpected',
    funny: 'Engaging',
    thoughtful: 'Insightful',
    savedInLibrary: 'Saved to Library',
    saveToLibrary: 'Save Story',
  },
  gu: {
    heroTag: 'ઇન્ટરેક્ટિવ વાર્તા વિશ્વ',
    heroTitle: 'જીવંત પ્રકૃતિ વાર્તાઓ અને ઇકોલોજી',
    heroSubtitle: 'ઇમર્સિવ વાર્તાઓમાં પ્રવેશ કરો, નવો માર્ગ પસંદ કરો અને અવાજ દ્વારા સાંભળો.',
    createStoryBtn: 'નવી વાર્તા બનાવો',
    featuredTitle: 'વ્હિસ્પરિંગ રેડવુડ કેનોપી',
    featuredDesc: 'એક પ્રાચીન વૃક્ષની છત્ર બાયોલ્યુમિનેસન્ટ ફૂગના નેટવર્કને છુપાવે છે.',
    continueReading: 'વાંચન ચાલુ રાખો',
    readStory: 'વાર્તા વાંચો',
    listenStory: 'સાંભળો',
    interactiveMode: 'ઇન્ટરેક્ટિવ શાખા માર્ગ',
    tabAll: 'બ્રહ્માંડ શોધો',
    tabMyStories: 'મારી લાઇબ્રેરી',
    tabFavorites: 'મનપસંદ',
    tabInteractive: 'શાખા માર્ગો',
    genreAll: 'બધી શ્રેણીઓ',
    genreNature: 'પ્રકૃતિ અને ઇકોલોજી',
    genreSciFi: 'વિજ્ઞાન અને પર્યાવરણ',
    genreMarine: 'સમુદ્રી જીવવિજ્ઞાન',
    genreBotany: 'વનસ્પતિ સંશોધન',
    genreExpedition: 'જંગલ અભિયાન',
    genreScience: 'ઇકોલોજીકલ વિજ્ઞાન',
    genreHabitats: 'પુનર્જીવિત રહેઠાણો',
    genreHeritage: 'વારસો અને લોકકથા',
    createModalTitle: 'વાર્તા બનાવો',
    promptLabel: 'વાર્તાનો વિચાર',
    titleLabel: 'વાર્તાનું શીર્ષક',
    genreLabel: 'શ્રેણી',
    moodLabel: 'વાતાવરણ',
    generateBtn: 'વાર્તા બનાવો',
    generatingText: 'વાર્તા તૈયાર થઈ રહી છે…',
    aiAssistantTitle: 'સ્ટોરી આસિસ્ટન્ટ',
    rewriteSection: 'વિભાગ સુધારો',
    changeMood: 'મૂડ બદલો',
    alternateEnding: 'વૈકલ્પિક અંત',
    continueStory: 'આગળનો અધ્યાય',
    translateStory: 'વાર્તા અનુવાદ કરો',
    customPromptPlaceholder: 'વાર્તામાં શું ફેરફાર કરવો છે તે લખો…',
    choicePrompt: 'તમારો નિર્ણય પસંદ કરો:',
    magical: 'પ્રેરણાદાયક',
    lovedIt: 'ખૂબ ગમ્યું',
    unexpected: 'અણધાર્યું',
    funny: 'રસપ્રદ',
    thoughtful: 'વિચારપ્રેરક',
    savedInLibrary: 'લાઇબ્રેરીમાં સંગ્રહિત',
    saveToLibrary: 'વાર્તા સાચવો',
  },
  hi: {
    heroTag: 'इंटरैक्टिव कहानी दुनिया',
    heroTitle: 'जीवंत प्रकृति कथाएं और पारिस्थितिकी',
    heroSubtitle: 'प्राकृतिक कहानियों में प्रवेश करें, नए रास्ते चुनें और आवाज से सुनें।',
    createStoryBtn: 'नई कहानी बनाएं',
    featuredTitle: 'विस्परिंग रेडवुड कैनोपी',
    featuredDesc: 'एक प्राचीन पेड़ की छत्र छाया बायोल्यूमिनसेंट कवक के नेटवर्क को दर्शाती है।',
    continueReading: 'पढ़ना जारी रखें',
    readStory: 'कहानी पढ़ें',
    listenStory: 'आवाज से सुनें',
    interactiveMode: 'इंटरैक्टिव विकल्प पथ',
    tabAll: 'दुनिया खोजें',
    tabMyStories: 'मेरी लाइब्रेरी',
    tabFavorites: 'पसंदीदा',
    tabInteractive: 'शाखा वाले रास्ते',
    genreAll: 'सभी श्रेणियां',
    genreNature: 'प्रकृति और पारिस्थितिकी',
    genreSciFi: 'वैज्ञानिक पर्यावरण',
    genreMarine: 'समुद्री जीवविज्ञान',
    genreBotany: 'वनस्पति अनुसंधान',
    genreExpedition: 'कैनोपी अभियान',
    genreScience: 'पारिस्थितिक विज्ञान',
    genreHabitats: 'पुनर्जीवित पर्यावास',
    genreHeritage: 'विरासत और लोककथा',
    createModalTitle: 'कहानी बनाएं',
    promptLabel: 'कहानी का विचार',
    titleLabel: 'कहानी का शीर्षक',
    genreLabel: 'श्रेणी',
    moodLabel: 'वातावरण',
    generateBtn: 'कहानी बनाएं',
    generatingText: 'कहानी तैयार हो रही है…',
    aiAssistantTitle: 'स्टोरी असिस्टेंट',
    rewriteSection: 'अनुभाग सुधारें',
    changeMood: 'मूड बदलें',
    alternateEnding: 'वैकल्पिक अंत',
    continueStory: 'अगला अध्याय',
    translateStory: 'कहानी का अनुवाद करें',
    customPromptPlaceholder: 'कहानी में क्या बदलाव करना चाहते हैं, लिखें…',
    choicePrompt: 'अपना निर्णय चुनें:',
    magical: 'प्रेरक',
    lovedIt: 'बहुत पसंद आया',
    unexpected: 'अनपेक्षित',
    funny: 'रोचक',
    thoughtful: 'विचारोत्तेजक',
    savedInLibrary: 'लाइब्रेरी में सहेजा गया',
    saveToLibrary: 'कहानी सहेजें',
  },
};

export default function Stories() {
  const { session } = useAuth();
  const { isDark } = useTheme();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = STORIES_TRANSLATIONS[lang] || STORIES_TRANSLATIONS.en;

  // Persistent Stories State
  const [stories, setStories] = useState(DEFAULT_STORIES);

  // Fetch remote user-created stories on mount
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/stories')
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item) => ({
            id: item._id || item.id,
            title: item.title,
            genre: item.genre || '🌿 Nature & Eco',
            mood: item.mood || 'Serene',
            readTime: item.readTime || '4 min read',
            isFeatured: false,
            isInteractive: Boolean(item.choices?.length),
            choices: item.choices || [],
            isMine: true,
            coverImage: item.image_url || item.coverImage || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
            summary: item.narrative ? item.narrative.slice(0, 160) + '...' : '',
            narrative: item.narrative || '',
            reactions: item.reactions || { magical: 12, lovedIt: 24, unexpected: 5, funny: 0, thoughtful: 18 },
          }));
          setStories((prev) => {
            const existingIds = new Set(formatted.map((s) => s.id));
            const remaining = prev.filter((s) => !existingIds.has(s.id));
            return [...formatted, ...remaining];
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [savedStoryIds, setSavedStoryIds] = useState([]);

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
  const [storyError, setStoryError] = useState('');
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

  // Hero Title Flip state
  const [isTitleFlipped, setIsTitleFlipped] = useState(false);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Nature & Ecology');
  const [newMood, setNewMood] = useState('Serene');
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
    setStoryError('');

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
          id: `story-${Date.now()}`,
          isMine: true,
          coverImage: res.story.coverImage || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
        };
        setStories([fullStory, ...stories]);
        setReadingStory(fullStory);
        setShowCreateModal(false);
        setNewTitle('');
        setNewPrompt('');
        apiFetch('/api/stories', {
          method: 'POST',
          body: JSON.stringify({
            title: fullStory.title,
            narrative: fullStory.narrative || fullStory.summary || '',
            species_highlights: [],
          }),
        }).catch(() => {});
      } else {
        setStoryError(res?.error || 'Could not generate the story. Please try again.');
      }
    } catch (err) {
      setStoryError(err?.message || 'Could not generate the story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Assistant Action Execution (Backend / Gemini Integration)
  const executeAIAssist = async (actionType, customInstruction) => {
    if (!readingStory) return;
    setAIAssistantLoading(true);
    setAiResult(null);
    setStoryError('');

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
        setStoryError(res?.error || 'The AI assistant could not produce a result.');
      }
    } catch (err) {
      setStoryError(err?.message || 'The AI assistant is temporarily unavailable.');
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
      return s.isMine;
    }
    return true;
  });

  return (
    <div className={`min-h-screen font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#061009] text-slate-100' : 'bg-[#FAF7F0] text-[#0F2418]'
    }`}>
      
      {/* ──────────────── IMMERSIVE STORY READER MODAL ──────────────── */}
      <AnimatePresence>
        {readingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 backdrop-blur-2xl overflow-y-auto flex flex-col justify-between transition-colors ${
              isDark ? 'bg-[#061009]/95 text-slate-100' : 'bg-[#FAF7F0]/98 text-[#0F2418]'
            }`}
          >
            {/* Top Reader Navigation Bar */}
            <div className={`sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between backdrop-blur-xl gap-3 border-b transition-colors ${
              isDark ? 'bg-[#0A180F]/95 border-[#20452F]' : 'bg-[#FDFBF7]/95 border-[#E3DDD1] shadow-xs'
            }`}>
              <button
                onClick={() => {
                  handleStopSpeech();
                  setReadingStory(null);
                  setSelectedChoiceIndex(null);
                  setShowAIAssistant(false);
                  setAiResult(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                  isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#183B28] hover:text-[#0F2418]'
                }`}
              >
                <ArrowLeft className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                <span className="hidden sm:inline">Exit Reader</span>
              </button>

              <div className="text-center min-w-0 flex-1 px-2">
                <p className={`text-[10px] uppercase tracking-wider font-semibold truncate ${
                  isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                }`}>{readingStory.genre} · {readingStory.mood}</p>
                <h3 className={`font-display text-sm sm:text-base font-bold truncate ${
                  isDark ? 'text-white' : 'text-[#0F2418]'
                }`}>{readingStory.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAIAssistant((v) => !v)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                    showAIAssistant 
                      ? isDark ? 'bg-[#4ADE80] text-[#07130B] font-bold' : 'bg-[#183B28] text-[#FAF7F0] font-bold'
                      : isDark ? 'bg-[#1A3827] border border-[#4ADE80]/50 text-[#4ADE80] hover:bg-[#20452F]' : 'bg-[#E1EFE0] border border-[#C3DEC0] text-[#183B28] hover:bg-[#D4E8D2]'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Story Assistant</span>
                </button>

                <button
                  onClick={() => toggleSaveStory(readingStory.id)}
                  className={`p-2 rounded-full border cursor-pointer transition-colors ${
                    savedStoryIds.includes(readingStory.id)
                      ? isDark ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28]'
                      : isDark ? 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#3E5C48] hover:text-[#0F2418]'
                  }`}
                  title="Save Story"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ──────────────── AI VOICE TO READ AUDIO CONTROL BAR ──────────────── */}
            <div className={`border-b px-4 sm:px-6 py-3 sticky top-[57px] z-10 shadow-sm transition-colors ${
              isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
            }`}>
              <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isSpeaking ? (
                    <button
                      onClick={() => handleSpeakStory()}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen to Story</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePauseResumeSpeech}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          isDark ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]' : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        }`}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      <button
                        onClick={handleStopSpeech}
                        className="p-1.5 rounded-full bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500/20 text-xs cursor-pointer"
                        title="Stop Voice"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  )}

                  {/* Equalizer Animation while speaking */}
                  {isSpeaking && !isPaused && (
                    <div className="flex items-center gap-0.5 px-2">
                      <span className={`w-1 h-3 rounded-full animate-pulse ${isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'}`} style={{ animationDuration: '0.4s' }} />
                      <span className={`w-1 h-5 rounded-full animate-pulse ${isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'}`} style={{ animationDuration: '0.7s' }} />
                      <span className={`w-1 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'}`} style={{ animationDuration: '0.3s' }} />
                      <span className={`w-1 h-4 rounded-full animate-pulse ${isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'}`} style={{ animationDuration: '0.5s' }} />
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
                        ? isDark ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28] font-bold'
                        : isDark ? 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#3E5C48] hover:text-[#0F2418]'
                    }`}
                    title="Toggle Soothing Forest Ambient Frequency"
                  >
                    <Music className="w-3 h-3" />
                    <span>Ambience</span>
                  </button>

                  {/* Voice Speed Selector */}
                  <div className={`flex items-center gap-1 border rounded-full p-0.5 ${
                    isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                  }`}>
                    {[0.8, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setSpeechRate(rate);
                          if (isSpeaking) {
                            handleSpeakStory();
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          speechRate === rate
                            ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0]'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
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
                      className={`border text-[10px] rounded-full px-2 py-1 outline-none max-w-[110px] truncate ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
                      }`}
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
                  className={`max-w-2xl mx-auto my-4 p-5 rounded-3xl shadow-2xl space-y-4 z-30 border ${
                    isDark ? 'bg-[#112318] border-[#4ADE80]/50 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
                  }`}
                >
                  <div className={`flex justify-between items-center border-b pb-2.5 ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}>
                    <p className={`text-sm font-bold flex items-center gap-2 ${
                      isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                    }`}>
                      <Sparkles className="w-4 h-4" /> {t.aiAssistantTitle}
                    </p>
                    <button onClick={() => setShowAIAssistant(false)} className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'}`}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick AI Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('rewrite')}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#E1EFE0] hover:border-[#183B28]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span>{t.rewriteSection}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('mood')}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#E1EFE0] hover:border-[#183B28]'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.changeMood}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('ending')}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#E1EFE0] hover:border-[#183B28]'
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-500" />
                      <span>{t.alternateEnding}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('continue')}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#E1EFE0] hover:border-[#183B28]'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.continueStory}</span>
                    </button>

                    <button
                      disabled={aiAssistantLoading}
                      onClick={() => executeAIAssist('translate')}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 col-span-2 sm:col-span-2 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#E1EFE0] hover:border-[#183B28]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>Translate to {selectedTargetLang}</span>
                    </button>
                  </div>

                  {/* Custom AI Prompt Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAssistPrompt}
                      onChange={(e) => setCustomAssistPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          executeAIAssist('custom');
                        }
                      }}
                      placeholder={t.customPromptPlaceholder}
                      className={`flex-1 rounded-2xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                        isDark ? 'bg-[#0E2015] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                      }`}
                    />
                    <button
                      disabled={aiAssistantLoading || !customAssistPrompt.trim()}
                      onClick={() => executeAIAssist('custom')}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-all ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* AI Generating Loading State */}
                  {aiAssistantLoading && (
                    <div className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-[#4ADE80] animate-pulse">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>AI is weaving story variations…</span>
                    </div>
                  )}

                  {/* AI Result Box */}
                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-2xl p-4 space-y-3 ${
                        isDark ? 'bg-[#0E2015] border-[#4ADE80]/40 text-white' : 'bg-[#E1EFE0]/60 border-[#C3DEC0] text-[#0F2418]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                        }`}>
                          ✨ AI Generated Enhancement
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeakStory(aiResult.text)}
                            className={`text-xs flex items-center gap-1 cursor-pointer ${
                              isDark ? 'text-slate-300 hover:text-[#4ADE80]' : 'text-[#3E5C48] hover:text-[#183B28]'
                            }`}
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
                            className={`text-xs flex items-center gap-1 cursor-pointer ${
                              isDark ? 'text-slate-300 hover:text-[#4ADE80]' : 'text-[#3E5C48] hover:text-[#183B28]'
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans p-3 rounded-xl border ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
                      }`}>
                        {aiResult.text}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => applyAIResultToStory('append')}
                          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                            isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                          }`}
                        >
                          ➕ Append to Narrative
                        </button>
                        <button
                          onClick={() => applyAIResultToStory('replace')}
                          className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/40 hover:bg-[#20452F]' : 'bg-[#EDE6D8] text-[#183B28] border-[#D4CBB8] hover:bg-[#E3DDD1]'
                          }`}
                        >
                          🔄 Replace Narrative
                        </button>
                        <button
                          onClick={() => setAiResult(null)}
                          className={`px-3 py-2 rounded-xl text-xs cursor-pointer ${
                            isDark ? 'bg-[#13271C] text-slate-400 hover:text-white' : 'bg-[#EDE6D8] text-[#3E5C48] hover:text-[#0F2418]'
                          }`}
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
                        className={`text-xs flex items-center gap-1 cursor-pointer ${
                          isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                        }`}
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
                <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                }`}>
                  {readingStory.genre} · {readingStory.mood}
                </span>
                <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
                  isDark ? 'text-white' : 'text-[#0F2418]'
                }`}>
                  {readingStory.title}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{readingStory.readTime}</p>
              </div>

              {readingStory.coverImage && (
                <img
                  src={readingStory.coverImage}
                  alt={readingStory.title}
                  className={`w-full h-72 object-cover rounded-3xl border shadow-2xl ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}
                />
              )}

              {/* Story Narrative Text */}
              <div className={`max-w-none text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line space-y-4 ${
                isDark ? 'text-slate-200' : 'text-[#2D4536]'
              }`}>
                {readingStory.narrative}
              </div>

              {/* Interactive Choice Branching Section */}
              {readingStory.isInteractive && readingStory.choices && (
                <div className={`p-6 rounded-3xl space-y-4 shadow-xl border ${
                  isDark ? 'bg-[#112318] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
                }`}>
                  <p className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                  }`}>
                    <Compass className="w-4 h-4" /> {t.choicePrompt}
                  </p>

                  <div className="space-y-2.5">
                    {readingStory.choices.map((choice, idx) => (
                      <button
                        key={choice.id}
                        onClick={() => setSelectedChoiceIndex(idx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          selectedChoiceIndex === idx
                            ? isDark
                              ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                              : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418] font-semibold shadow-md'
                            : isDark
                              ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                              : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#EDE6D8]'
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
                      className={`border p-4 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed mt-3 ${
                        isDark ? 'bg-[#0E2015] border-[#20422E] text-slate-200' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#0F2418]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>🌿 Chosen Branch Outcome:</p>
                        <button
                          onClick={() => handleSpeakStory(readingStory.choices[selectedChoiceIndex].nextText)}
                          className={`text-xs hover:underline flex items-center gap-1 cursor-pointer ${
                            isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                          }`}
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
              <div className={`flex flex-wrap items-center justify-between gap-3 pt-6 border-t ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Reactions</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'magical', label: t.magical, Icon: Sparkles },
                    { key: 'lovedIt', label: t.lovedIt, Icon: Heart },
                    { key: 'unexpected', label: t.unexpected, Icon: Compass },
                    { key: 'funny', label: t.funny, Icon: Smile },
                    { key: 'thoughtful', label: t.thoughtful, Icon: Brain },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleReaction(readingStory.id, key)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:bg-[#EDE6D8]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{label}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({readingStory.reactions?.[key] || 0})</span>
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-auto border transition-colors ${
                isDark ? 'bg-[#112318] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <h2 className={`font-display text-2xl font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#0F2418]'
                }`}>
                  <Wand2 className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                  <span>{t.createModalTitle}</span>
                </h2>
                <button onClick={() => setShowCreateModal(false)} className={`cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                    isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                  }`}>
                    {t.promptLabel}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="e.g., A girl discovers glowing spores in an ancient cedar forest that respond to birdsong..."
                    className={`w-full rounded-2xl p-3.5 text-xs sm:text-sm outline-none resize-none transition-colors ${
                      isDark ? 'bg-[#0E2015] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                      isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                    }`}>
                      {t.titleLabel}
                    </label>
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Story Title (Optional)"
                      className={`w-full rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-colors ${
                        isDark ? 'bg-[#0E2015] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                      isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                    }`}>
                      {t.genreLabel}
                    </label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className={`w-full rounded-2xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-colors ${
                        isDark ? 'bg-[#0E2015] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                      }`}
                    >
                      <option value="Nature & Ecology">{t.genreNature}</option>
                      <option value="Speculative Ecology">{t.genreSciFi}</option>
                      <option value="Marine Biology">{t.genreMarine}</option>
                      <option value="Botanical Fieldwork">{t.genreBotany}</option>
                      <option value="Canopy Expedition">{t.genreExpedition}</option>
                      <option value="Ecological Science">{t.genreScience}</option>
                      <option value="Regenerative Habitats">{t.genreHabitats}</option>
                      <option value="Folklore & Heritage">{t.genreHeritage}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full py-3 rounded-full font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? t.generatingText : t.generateBtn}</span>
                </button>

                {storyError && (
                  <div className="bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500 flex items-start gap-2">
                    <span className="mt-0.5 font-bold">✕</span>
                    <span>{storyError}</span>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className={`relative rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden border transition-colors ${
          isDark ? 'bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border-[#20452F] text-white' : 'bg-gradient-to-r from-[#EDE6D8] via-[#F2ECE1] to-[#FAF7F0] border-[#E3DDD1] text-[#0F2418] shadow-sm'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                {t.heroTag}
              </span>
              <motion.h1
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsTitleFlipped((v) => !v)}
                className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight cursor-pointer select-none"
                title="Click to flip title!"
              >
                <span className={`inline-block bg-clip-text text-transparent drop-shadow-xs ${
                  isDark ? 'bg-gradient-to-r from-white via-emerald-200 to-[#4ADE80]' : 'bg-gradient-to-r from-[#0F2418] via-[#183B28] to-[#2D5E40]'
                }`}>
                  {isTitleFlipped ? '✨ Neural Ecosystem Stories ✨' : t.heroTitle}
                </span>
              </motion.h1>
              <p className={`text-xs sm:text-sm font-normal leading-relaxed ${
                isDark ? 'text-slate-300/90' : 'text-[#3E5C48]'
              }`}>
                {t.heroSubtitle}
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className={`px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer shrink-0 ${
                isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/25' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.createStoryBtn}</span>
            </button>
          </div>
        </div>

        {/* ──────────────── FEATURED SPOTLIGHT ──────────────── */}
        {featuredStory && (
          <div className={`rounded-3xl overflow-hidden shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative h-72 lg:h-96 overflow-hidden">
                <img
                  src={featuredStory.coverImage || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&q=80'}
                  alt={featuredStory.title}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&q=80';
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className={`absolute inset-0 lg:hidden ${
                  isDark ? 'bg-gradient-to-t from-[#0E2015] via-transparent to-transparent' : 'bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent'
                }`} />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                    }`}>
                      ★ FEATURED CHRONICLE
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{featuredStory.readTime}</span>
                  </div>

                  <h2 className={`font-display text-2xl sm:text-3xl font-extrabold leading-tight ${
                    isDark ? 'text-white' : 'text-[#0F2418]'
                  }`}>
                    {featuredStory.title}
                  </h2>

                  <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                    isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                  }`}>
                    {featuredStory.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setReadingStory(featuredStory)}
                    className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                      isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/20' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.readStory}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReadingStory(featuredStory);
                      setTimeout(() => handleSpeakStory(`${featuredStory.title}. ${featuredStory.narrative}`), 300);
                    }}
                    className={`px-5 py-3 rounded-full border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white hover:border-[#4ADE80]' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                    <span>{t.listenStory}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── CONTROLS: SEARCH & GENRE PILLS ──────────────── */}
        <div className={`rounded-3xl p-5 space-y-4 shadow-xl border transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Compass className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chronicles, topics, mycelial networks…"
                className={`w-full rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-colors ${
                  isDark ? 'bg-[#13271C] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                }`}
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: t.tabAll, Icon: BookOpen },
                { id: 'favorites', label: `${t.tabFavorites} (${savedStoryIds.length})`, Icon: Bookmark },
                { id: 'interactive', label: t.tabInteractive, Icon: Compass },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === id
                      ? isDark
                        ? 'bg-[#4ADE80] text-[#07130B] font-bold shadow-md'
                        : 'bg-[#183B28] text-[#FAF7F0] font-bold shadow-sm'
                      : isDark
                        ? 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white'
                        : 'bg-[#EDE6D8] border border-[#D4CBB8] text-[#3E5C48] hover:bg-[#E3DDD1]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
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
                      ? isDark
                        ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]'
                        : 'bg-[#183B28] text-[#FAF7F0] border-[#183B28]'
                      : isDark
                        ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:bg-[#1A3827]'
                        : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#3E5C48] hover:bg-[#E3DDD1]'
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
                className={`rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all cursor-pointer group focus:outline-none focus:ring-2 border ${
                  isDark
                    ? 'bg-[#0E2015] border-[#20452F] hover:border-[#4ADE80]/60 focus:ring-[#4ADE80] text-white'
                    : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28]/60 focus:ring-[#183B28] text-[#0F2418] shadow-sm'
                }`}
              >
                {/* Image Banner */}
                <div className={`relative h-48 w-full overflow-hidden ${isDark ? 'bg-[#13271C]' : 'bg-[#EDE6D8]'}`}>
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 ${
                    isDark ? 'bg-gradient-to-t from-[#0E2015] via-transparent to-black/30' : 'bg-gradient-to-t from-[#FDFBF7]/90 via-transparent to-black/20'
                  }`} />
                  
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
                    <h3 className={`font-display text-lg font-bold transition-colors line-clamp-1 ${
                      isDark ? 'text-white group-hover:text-[#4ADE80]' : 'text-[#0F2418] group-hover:text-[#183B28]'
                    }`}>
                      {story.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                    }`}>
                      {story.summary}
                    </p>
                  </div>

                  {/* Card Footer & Action Buttons */}
                  <div className={`pt-3 border-t flex items-center justify-between ${
                    isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                  }`}>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{story.readTime}</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadingStory(story);
                          setTimeout(() => handleSpeakStory(`${story.title}. ${story.narrative}`), 300);
                        }}
                        className={`p-1.5 rounded-full border transition-colors ${
                          isDark ? 'bg-[#13271C] text-slate-300 hover:text-[#4ADE80] hover:bg-[#1A3827] border-[#20422E]' : 'bg-[#EDE6D8] text-[#183B28] hover:text-[#0F2418] hover:bg-[#E3DDD1] border-[#D4CBB8]'
                        }`}
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
                            ? isDark ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#183B28] text-[#FAF7F0] border-[#183B28]'
                            : isDark ? 'bg-[#13271C] text-slate-400 border-[#20422E] hover:text-white' : 'bg-[#EDE6D8] text-[#3E5C48] border-[#D4CBB8] hover:bg-[#E3DDD1]'
                        }`}
                        title="Save to Library"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <span className={`p-1.5 rounded-full transition-colors ${
                        isDark ? 'bg-[#13271C] text-slate-300 group-hover:text-[#4ADE80] group-hover:bg-[#1A3827]' : 'bg-[#EDE6D8] text-[#183B28] group-hover:text-[#0F2418] group-hover:bg-[#E3DDD1]'
                      }`}>
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
