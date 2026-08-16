import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, Copy, Check, Sparkles, Sun, Bell, User, Image as ImageIcon, Mic, CheckCheck, Globe, ChevronDown, History, Plus, Edit2, Trash2, X, MessageSquare, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { chatWithPulse } from '../lib/openrouter';
import { ErrorBanner } from '../components/ui';

// Multilingual UI Translations Dictionary
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to',
    title: 'Pulse',
    tagline1: 'Calm, encouraging, intelligent, practical.',
    tagline2: 'Never a know-it-all.',
    badge1: 'Live Neural Sensing',
    badge2: 'Your Ecological Guide',
    clearThread: 'Clear thread',
    historyTitle: 'Chat History',
    newChat: 'New Chat',
    welcomeBotMsg1: "Hi there! 🍃 I'm Pulse, your ecological guide.",
    welcomeBotMsg2: 'Tell me about your surroundings today or what species you are curious about.',
    inputPlaceholder: 'Ask Pulse about what is around you...',
    thinking: 'Pulse is thinking...',
    notebookLoading: 'Opening field notebook…',
    disclaimer: 'Pulse AI can make mistakes. Please verify important information.',
    modalTitle: 'Choose Your Language',
    modalSubtitle: 'Select how Pulse should communicate with you.',
    langName: 'English',
    langFlag: '🇬🇧',
    noHistory: 'No previous conversations saved yet.',
    listening: 'Listening… speak now',
    listeningTitle: 'Pulse Neural Voice Input',
    listeningHint: 'Speak naturally in English, Gujarati, or Hindi',
    doneListening: 'Done Listening',
  },
  gu: {
    welcome: 'સ્વાગત છે',
    title: 'પલ્સ',
    tagline1: 'શાંત, પ્રોત્સાહક, બુદ્ધિશાળી, વ્યવહારુ.',
    tagline2: 'ક્યારેય જ્ઞાની નથી.',
    badge1: 'લાઈવ ન્યુરલ સેન્સિંગ',
    badge2: 'તમારું ઇકોલોજીકલ ગાઇડ',
    clearThread: 'થ્રેડ સાફ કરો',
    historyTitle: 'વાતચીતનો ઇતિહાસ',
    newChat: 'નવી ચેટ',
    welcomeBotMsg1: 'નમસ્તે! 🍃 હું પલ્સ છું, તમારો ઇકોલોજીકલ ગાઇડ.',
    welcomeBotMsg2: 'આજે તમારી આસપાસના વાતાવરણ વિશે અથવા તમે કઈ પ્રજાતિ વિશે ઉત્સુક છો તે મને જણાવો.',
    inputPlaceholder: 'તમારી આસપાસ શું છે તે વિશે પલ્સને પૂછો...',
    thinking: 'પલ્સ વિચારી રહ્યું છે...',
    notebookLoading: 'ફિલ્ડ નોટબુક ખોલી રહ્યું છે…',
    disclaimer: 'Pulse AI ભૂલો કરી શકે છે. કૃપા કરીને મહત્વપૂર્ણ માહિતી ચકાસો.',
    modalTitle: 'તમારી ભાષા પસંદ કરો',
    modalSubtitle: 'પલ્સ તમારી સાથે કેવી રીતે વાતચીત કરે તે પસંદ કરો.',
    langName: 'ગુજરાતી',
    langFlag: '🇮🇳',
    noHistory: 'હજુ સુધી કોઈ જૂની વાતચીત સંગ્રહિત નથી.',
    listening: 'સાંભળી રહ્યું છે… બોલો',
    listeningTitle: 'પલ્સ વૉઇસ લિસનિંગ',
    listeningHint: 'ગુજરાતી, હિન્દી કે અંગ્રેજીમાં બોલો',
    doneListening: 'પૂર્ણ થયું',
  },
  hi: {
    welcome: 'स्वागत है',
    title: 'पल्स',
    tagline1: 'शांत, उत्साहवर्धक, बुद्धिमान, व्यावहारिक।',
    tagline2: 'कभी भी सर्वज्ञाता नहीं।',
    badge1: 'लाइव न्यूरल सेंसिंग',
    badge2: 'आपका इकोलॉजिकल गाइड',
    clearThread: 'थ्रेड साफ़ करें',
    historyTitle: 'बातचीत का इतिहास',
    newChat: 'नयी चैट',
    welcomeBotMsg1: 'नमस्ते! 🍃 मैं पल्स हूँ, आपका इकोलॉजिकल गाइड।',
    welcomeBotMsg2: 'आज अपने परिवेश के बारे में या जिन प्रजातियों के बारे में आप उत्सुक हैं, उनके बारे में मुझे बताएं।',
    inputPlaceholder: 'अपने आस-पास के वातावरण के बारे में पल्स से पूछें...',
    thinking: 'पल्स सोच रहा है...',
    notebookLoading: 'फील्ड नोटबुक खोली जा रही है…',
    disclaimer: 'Pulse AI गलतियां कर सकता है। कृपया महत्वपूर्ण जानकारी सत्यापित करें।',
    modalTitle: 'अपनी भाषा चुनें',
    modalSubtitle: 'चुनें कि पल्स आपके साथ कैसे संवाद करे।',
    langName: 'हिंदी',
    langFlag: '🇮🇳',
    noHistory: 'अभी तक कोई पुरानी बातचीत सहेजी नहीं गई है।',
    listening: 'सुन रहा है… अब बोलें',
    listeningTitle: 'पल्स वॉइस लिसनिंग',
    listeningHint: 'हिंदी, गुजराती या अंग्रेजी में बोलें',
    doneListening: 'हो गया',
  },
};

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
];

const TRANSLATION_LOOKUP = {
  'what is photosynthesis?': {
    en: 'What is photosynthesis?',
    gu: 'પ્રકાશસંશ્લેષણ શું છે?',
    hi: 'प्रकाश संश्लेषण क्या है?',
  },
  'પ્રકાશસંશ્લેષણ શું છે?': {
    en: 'What is photosynthesis?',
    gu: 'પ્રકાશસંશ્લેષણ શું છે?',
    hi: 'प्रकाश संश्लेषण क्या है?',
  },
  'प्रकाश संश्लेषण क्या है?': {
    en: 'What is photosynthesis?',
    gu: 'પ્રકાશસંશ્લેષણ શું છે?',
    hi: 'प्रकाश संश्लेषण क्या है?',
  },
};

function translateTextFast(str = '', targetLang = 'en') {
  if (!str) return str;
  const s = str.trim();
  const match = TRANSLATION_LOOKUP[s.toLowerCase()];
  if (match && match[targetLang]) {
    return match[targetLang];
  }

  const lower = s.toLowerCase();
  if (lower.includes('photosynthesis') || lower.includes('પ્રકાશસંશ્લેષણ') || lower.includes('प्रकाश संश्लेषण')) {
    if (targetLang === 'gu') return 'પ્રકાશસંશ્લેષણ એ એવી પ્રક્રિયા છે જેના દ્વારા લીલા છોડ અને વૃક્ષો પોષક તત્ત્વો બનાવવા અને વાતાવરણમાં ઓક્સિજન છોડવા માટે સૂર્યપ્રકાશ, પાણી અને કાર્બન ડાયોક્સાઇડનો ઉપયોગ કરે છે.';
    if (targetLang === 'hi') return 'प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा हरे पौधे और पेड़ पोषक तत्वों को संश्लेषित करने और वायुमंडल में ऑक्सीजन छोड़ने के लिए सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करते हैं।';
    return 'Photosynthesis is the process by which green plants and trees use sunlight, water, and carbon dioxide to synthesize nutrients and release oxygen into the atmosphere.';
  }

  if (lower.includes('bird') || lower.includes('પક્ષી') || lower.includes('पक्षी') || lower.includes('lake') || lower.includes('તળાવ') || lower.includes('झील')) {
    if (targetLang === 'gu') return 'તળાવ કે જળાશય પાસે સવારે તમે કિંગફિશર (કિલકિલા), બગલા (Egret), જળમુરઘી (Coot) અને બતક જોઈ શકો છો.';
    if (targetLang === 'hi') return 'सुबह के समय झील के पास आप किंगफिशर, बगुला (Egret), जलमुर्गी (Coot) और बत्तख देख सकते हैं।';
    return 'Near a lake in the morning, you can typically spot Kingfishers, Egrets, Coots, and Herons.';
  }

  return s;
}

// Larger, Taller Glowing EKG Pulse Orb
function EkgPulseOrb({ size = 84, active = false }) {
  return (
    <div className="relative inline-flex items-center justify-center shrink-0 gpu-layer" style={{ width: size, height: size }}>
      <motion.span
        animate={active ? { scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4] } : { scale: [0.96, 1.1, 0.96], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: active ? 1.2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-[#4ADE80]/30 blur-md"
      />
      <div className="absolute inset-[3%] rounded-full bg-gradient-to-br from-[#2E6141] via-[#163321] to-[#0A180F] p-[2px] shadow-xl">
        <div className="w-full h-full rounded-full bg-[#0E2015] flex items-center justify-center relative overflow-hidden border border-[#3E7D55]/60">
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 relative z-10">
            <motion.path
              d="M 10 50 L 30 50 L 37 32 L 45 68 L 53 20 L 61 78 L 69 40 L 76 54 L 82 50 L 90 50"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="4.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={active ? { opacity: [0.5, 1, 0.5] } : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 8px #4ADE80)' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function LeafBranchHeader() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden hidden md:block select-none">
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#E6C176] animate-pulse"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            right: `${15 + (i * 9) % 35}%`,
            top: `${20 + (i * 11) % 60}%`,
            boxShadow: '0 0 8px #E6C176',
            animationDuration: `${2 + (i % 3)}s`,
          }}
        />
      ))}
      <svg viewBox="0 0 320 220" className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-75">
        <path d="M 240 220 Q 200 130 130 30" fill="none" stroke="#1D452B" strokeWidth="4" strokeLinecap="round" />
        <path d="M 130 30 Q 150 10 175 22 Q 150 45 130 30" fill="#285C3A" stroke="#3D8254" strokeWidth="1.5" />
        <path d="M 150 60 Q 185 45 205 60 Q 160 85 150 60" fill="#1C452A" stroke="#316B45" strokeWidth="1.5" />
        <path d="M 175 95 Q 215 80 235 100 Q 200 125 175 95" fill="#2C6942" stroke="#489A63" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function BouncingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#13271C] border border-[#20422E] rounded-2xl rounded-tl-xs shadow-xs">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay }}
          className="w-2 h-2 rounded-full bg-[#4ADE80]"
        />
      ))}
    </div>
  );
}

// Suggested starter prompts
const STARTERS = [
  'What bird is singing outside my window?',
  'I have 5 minutes — what should I notice?',
  'Why do leaves change color in autumn?',
  'What lives in the moss on my garden wall?',
];

export default function PulseChat() {
  const { toggleTheme } = useTheme();

  const [lang, setLang] = useState(() => localStorage.getItem('pulse_chat_lang') || 'en');
  const [showLangModal, setShowLangModal] = useState(() => !localStorage.getItem('pulse_lang_selected'));
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // File Upload & Speech Recognition state
  const fileInputRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_saved_threads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    return localStorage.getItem('pulse_active_thread_id') || '';
  });

  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const endRef = useRef(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    let currentThreads = [...threads];
    if (!currentThreads.length) {
      const defaultThread = {
        id: `thread-${Date.now()}`,
        title: 'Ecological Inquiry',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      };
      currentThreads = [defaultThread];
      setThreads(currentThreads);
      setActiveThreadId(defaultThread.id);
      localStorage.setItem('pulse_saved_threads', JSON.stringify(currentThreads));
      localStorage.setItem('pulse_active_thread_id', defaultThread.id);
      setMessages([]);
    } else {
      const active = currentThreads.find((th) => th.id === activeThreadId) || currentThreads[0];
      setActiveThreadId(active.id);
      localStorage.setItem('pulse_active_thread_id', active.id);
      setMessages(active.messages || []);
    }
    setLoading(false);
  }, []);

  const saveActiveThreadMessages = (updatedMsgs) => {
    setThreads((prevThreads) => {
      const nextThreads = prevThreads.map((th) => {
        if (th.id === activeThreadId) {
          const autoTitle =
            th.title && th.title !== 'Ecological Inquiry' && th.title !== 'New Conversation'
              ? th.title
              : updatedMsgs.find((m) => m.role === 'user')?.content.slice(0, 28) || 'Ecological Inquiry';
          return {
            ...th,
            title: autoTitle,
            updated_at: new Date().toISOString(),
            messages: updatedMsgs,
          };
        }
        return th;
      });
      localStorage.setItem('pulse_saved_threads', JSON.stringify(nextThreads));
      return nextThreads;
    });
  };

  const selectLanguage = (code) => {
    setLang(code);
    localStorage.setItem('pulse_chat_lang', code);
    localStorage.setItem('pulse_lang_selected', '1');
    setShowLangModal(false);
    setShowLangDropdown(false);

    setMessages((prevMsgs) => {
      const translated = prevMsgs.map((m) => ({
        ...m,
        content: translateTextFast(m.content, code),
      }));
      saveActiveThreadMessages(translated);
      return translated;
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multilingual Voice Input Handler with Animated Modal Popup
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is supported in Google Chrome and Microsoft Edge browsers.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      if (lang === 'gu') {
        recognition.lang = 'gu-IN';
      } else if (lang === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const startNewChat = () => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };
    const nextThreads = [newThread, ...threads];
    setThreads(nextThreads);
    setActiveThreadId(newThread.id);
    setMessages([]);
    localStorage.setItem('pulse_saved_threads', JSON.stringify(nextThreads));
    localStorage.setItem('pulse_active_thread_id', newThread.id);
    setShowHistoryDrawer(false);
  };

  const loadThread = (threadId) => {
    const th = threads.find((t) => t.id === threadId);
    if (!th) return;
    setActiveThreadId(th.id);
    setMessages(th.messages || []);
    localStorage.setItem('pulse_active_thread_id', th.id);
    setShowHistoryDrawer(false);
  };

  const deleteThread = (e, threadId) => {
    e.stopPropagation();
    const nextThreads = threads.filter((t) => t.id !== threadId);
    setThreads(nextThreads);
    localStorage.setItem('pulse_saved_threads', JSON.stringify(nextThreads));

    if (activeThreadId === threadId) {
      if (nextThreads.length > 0) {
        setActiveThreadId(nextThreads[0].id);
        setMessages(nextThreads[0].messages || []);
        localStorage.setItem('pulse_active_thread_id', nextThreads[0].id);
      } else {
        startNewChat();
      }
    }
  };

  const handleRenameThread = (e, threadId) => {
    e.stopPropagation();
    if (!editTitleText.trim()) return;
    setThreads((prev) => {
      const updated = prev.map((th) => (th.id === threadId ? { ...th, title: editTitleText.trim() } : th));
      localStorage.setItem('pulse_saved_threads', JSON.stringify(updated));
      return updated;
    });
    setEditingThreadId(null);
    setEditTitleText('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, busy]);

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content && !attachedImage) return;

    let fullMessageContent = content;
    if (attachedImage && !content) {
      fullMessageContent = '[Attached Image Observation]';
    }

    setText('');
    setAttachedImage(null);
    setBusy(true);
    setError('');

    const newMsgs = [
      ...messages,
      { id: Date.now(), user_id: '', role: 'user', content: fullMessageContent, created_at: new Date().toISOString() },
    ];
    setMessages(newMsgs);
    saveActiveThreadMessages(newMsgs);

    try {
      const history = newMsgs
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));
      const replyContent = await chatWithPulse(history);
      const reply = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyContent,
        created_at: new Date().toISOString(),
      };
      const finalMsgs = [...newMsgs, reply];
      setMessages(finalMsgs);
      saveActiveThreadMessages(finalMsgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse is quiet right now. Try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(text);
  };

  const clear = () => {
    setMessages([]);
    saveActiveThreadMessages([]);
  };

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const todayDateString = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="h-[calc(100vh-2rem)] md:h-screen w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 flex flex-col overflow-hidden text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white relative gpu-layer">
      {/* Hidden File Input for Image Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <style>{`
        .custom-chat-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(32, 69, 46, 0.7);
          border-radius: 9999px;
        }
        .custom-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(74, 222, 128, 0.5);
        }
      `}</style>

      {/* ──────────────── FUTURISTIC VOICE LISTENING MODAL ──────────────── */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07130B]/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 20 }}
              className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4ADE80]/20 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

              <div className="space-y-2">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#4ADE80]/30 blur-md"
                  />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E6141] to-[#0A180F] border-2 border-[#4ADE80] flex items-center justify-center shadow-lg relative z-10">
                    <Mic className="w-9 h-9 text-[#4ADE80] animate-bounce" />
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white tracking-tight pt-2">
                  {t.listeningTitle}
                </h3>
                <p className="text-xs text-slate-400">{t.listeningHint}</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-xs font-semibold text-[#4ADE80] border border-[#4ADE80]/30">
                  🌐 {t.langName} Mode ({lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-US'})
                </span>
              </div>

              {/* Live Transcribed Speech Preview Box */}
              <div className="bg-[#0E2015] border border-[#20422E] rounded-2xl p-4 min-h-[90px] flex items-center justify-center text-center">
                <p className="text-sm sm:text-base font-normal text-slate-200 leading-relaxed italic">
                  {text ? `"${text}"` : t.listening}
                </p>
              </div>

              {/* Dynamic Soundwave Visualizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[0.1, 0.3, 0.15, 0.45, 0.2, 0.5, 0.25, 0.4].map((delay, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ['8px', '32px', '12px', '28px', '8px'] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-moss via-sage to-[#4ADE80]"
                  />
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={toggleListening}
                  className="px-6 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-semibold text-sm hover:bg-[#3ECE77] transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  <span>{t.doneListening}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── LANGUAGE SELECTION MODAL ──────────────── */}
      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07130B]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#112318] border border-[#20452F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1A3827] border border-[#2D5A3F] flex items-center justify-center text-xl">
                  🌐
                </div>
                <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
                  {t.modalTitle}
                </h2>
                <p className="text-xs text-slate-400 font-normal">
                  {t.modalSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => selectLanguage(l.code)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all cursor-pointer ${
                      lang === l.code
                        ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                        : 'bg-[#13271C]/70 border-[#20422E] text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{l.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-sm leading-snug">{l.native}</p>
                        <p className="text-[11px] text-slate-400">{l.name}</p>
                      </div>
                    </div>
                    {lang === l.code && (
                      <span className="w-5 h-5 rounded-full bg-[#4ADE80] text-[#07130B] flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── HISTORY SIDEBAR DRAWER ──────────────── */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end"
            onClick={() => setShowHistoryDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="w-full max-w-sm h-full bg-[#0E1F14] border-l border-[#20452F] p-5 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-base">
                    <History className="w-5 h-5 text-[#4ADE80]" />
                    <span>{t.historyTitle}</span>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A3827]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#4ADE80] text-[#07130B] font-medium text-sm hover:bg-[#3ECE77] transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newChat}</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroll">
                  {!threads.length ? (
                    <p className="text-xs text-slate-500 py-8 text-center">{t.noHistory}</p>
                  ) : (
                    threads.map((th) => (
                      <div
                        key={th.id}
                        onClick={() => loadThread(th.id)}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                          activeThreadId === th.id
                            ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                            : 'bg-[#13271C]/60 border-[#20422E] text-slate-300 hover:bg-[#173022]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className="w-4 h-4 shrink-0 text-[#4ADE80]" />
                            {editingThreadId === th.id ? (
                              <input
                                autoFocus
                                value={editTitleText}
                                onChange={(e) => setEditTitleText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameThread(e, th.id);
                                }}
                                onBlur={(e) => handleRenameThread(e, th.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#0E2015] border border-[#4ADE80] px-2 py-0.5 rounded text-xs text-white outline-none w-full"
                              />
                            ) : (
                              <p className="text-xs font-semibold truncate leading-snug">{th.title}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingThreadId(th.id);
                                setEditTitleText(th.title);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#254B35]"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => deleteThread(e, th.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#254B35]"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {th.messages?.length
                            ? th.messages[th.messages.length - 1].content
                            : 'No messages yet'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── TOP HERO BANNER CARD (Increased Height & Larger Fonts) ──────────────── */}
      <div className="shrink-0 relative bg-[#112318]/90 border border-[#20452F] rounded-3xl p-7 sm:p-9 min-h-[175px] shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-5 right-5 flex items-center gap-2.5 z-20">
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="px-3 py-1.5 rounded-full bg-[#1A3626] hover:bg-[#254B35] border border-[#2D5A3F] flex items-center gap-1.5 text-xs sm:text-sm text-slate-100 font-medium transition-colors cursor-pointer"
            title="Chat History"
          >
            <History className="w-4 h-4 text-[#4ADE80]" />
            <span className="hidden sm:inline">{t.historyTitle}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangDropdown((v) => !v)}
              className="px-3.5 py-1.5 rounded-full bg-[#1A3626] hover:bg-[#254B35] border border-[#2D5A3F] flex items-center gap-1.5 text-xs sm:text-sm text-slate-100 font-medium transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-[#4ADE80]" />
              <span>{t.langName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-40 bg-[#13271C] border border-[#20422E] rounded-2xl p-1.5 shadow-2xl z-30 space-y-1"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${
                        lang === l.code ? 'bg-[#1A3827] text-[#4ADE80]' : 'text-slate-300 hover:bg-[#1A3827]/60 hover:text-white'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.native}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="w-9 h-9 rounded-full bg-[#1A3626] hover:bg-[#254B35] border border-[#2D5A3F] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Sun className="w-4 h-4" />
          </button>
          
          <button
            title="Notifications"
            className="w-9 h-9 rounded-full bg-[#1A3626] hover:bg-[#254B35] border border-[#2D5A3F] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#1A3626] border border-[#2D5A3F] flex items-center justify-center text-slate-200">
              <User className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-[#112318]" />
          </div>

          <button
            onClick={clear}
            className="ml-1 text-xs text-emerald-400/80 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Clear Thread"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <LeafBranchHeader />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 pr-0 md:pr-40">
          <EkgPulseOrb size={84} active={busy} />

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">{t.welcome}</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white flex items-center gap-2">
              {t.title} <span className="text-2xl sm:text-3xl">🍃</span>
            </h1>

            <div className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal pt-0.5">
              <p>{t.tagline1}</p>
              <p>{t.tagline2}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm text-slate-200 font-medium">
              <div className="flex items-center gap-1.5">
                <span>🍃</span>
                <span>{t.badge1}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{t.badge2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── DATE DIVIDER ──────────────── */}
      <div className="shrink-0 flex justify-center my-3">
        <span className="px-4 py-1 rounded-full bg-[#122519] border border-[#20452F] text-xs text-slate-400 tracking-wider">
          {todayDateString}
        </span>
      </div>

      {/* ──────────────── CHAT MESSAGES THREAD ──────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-1.5 custom-chat-scroll">
        {loading && (
          <div className="flex items-center justify-center py-10 gap-3 text-sm text-emerald-400/80">
            <EkgPulseOrb size={34} active={true} />
            <span className="animate-pulse">{t.notebookLoading}</span>
          </div>
        )}

        {!loading && !messages.length && (
          <div className="flex items-start gap-3.5 justify-start max-w-full">
            <EkgPulseOrb size={40} />
            <div className="max-w-lg bg-[#13271C] border border-[#20422E] border-l-4 border-l-[#4ADE80] text-slate-100 rounded-2xl rounded-tl-xs p-4.5 shadow-md space-y-2 relative">
              <p className="text-base font-medium leading-relaxed pr-4">
                {t.welcomeBotMsg1}
              </p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {t.welcomeBotMsg2}
              </p>
              <p className="text-xs text-slate-400 text-right pt-1">{formatTime()}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-3 group max-w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <div className="shrink-0 mb-0.5">
                  <EkgPulseOrb size={36} />
                </div>
              )}

              <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
                <div
                  className={`relative w-full px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-md ${
                    m.role === 'user'
                      ? 'bg-[#1A3827] border border-[#2D5A3F] text-white rounded-2xl rounded-tr-xs'
                      : 'bg-[#13271C] border border-[#20422E] border-l-4 border-l-[#4ADE80] text-slate-100 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  <div className={m.role !== 'user' ? 'pr-6' : ''}>{m.content}</div>

                  {m.role !== 'user' && (
                    <button
                      onClick={() => copyMessage(m.id, m.content)}
                      className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white rounded-md hover:bg-[#1A3827]"
                      title="Copy message"
                    >
                      {copiedId === m.id ? <Check className="w-4 h-4 text-[#4ADE80]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 px-1">
                  <span>{formatTime(m.created_at)}</span>
                  {m.role === 'user' && <CheckCheck className="w-4 h-4 text-[#4ADE80]" />}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>

        {/* Thinking State */}
        {busy && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4ADE80] pl-1 font-medium">
              <svg viewBox="0 0 100 100" className="w-4 h-4">
                <path d="M 10 50 L 35 50 L 45 25 L 55 75 L 65 40 L 75 55 L 90 50" fill="none" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <span>{t.thinking}</span>
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
            </div>

            <div className="flex items-center gap-3 justify-start">
              <EkgPulseOrb size={36} active={true} />
              <BouncingDots />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && (
        <div className="shrink-0 my-1">
          <ErrorBanner message={error} />
        </div>
      )}

      {/* ──────────────── BOTTOM FLOATING INPUT CONSOLE ──────────────── */}
      <form onSubmit={send} className="shrink-0 pt-2 pb-1 space-y-1.5">
        {/* Thumbnail Preview for Image Attachment */}
        {attachedImage && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#12241A] border border-[#234A33] rounded-2xl w-fit">
            <img src={attachedImage} alt="Attachment" className="w-8 h-8 rounded object-cover border border-[#4ADE80]/40" />
            <span className="text-xs text-slate-300">Image attached</span>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 text-slate-400 hover:text-red-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative bg-[#12241A]/95 border border-[#234A33] rounded-full p-2 pl-5 sm:pl-6 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all focus-within:border-[#4ADE80]/70 focus-within:ring-2 focus-within:ring-[#4ADE80]/20">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-white placeholder:text-slate-500 font-normal"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Image File Picker Button */}
            <button
              type="button"
              onClick={handleImageClick}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#1C3A29] transition-colors cursor-pointer"
              title="Attach Image / Observation"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Multilingual Voice Speech-to-Text Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-[#1C3A29]'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={busy || (!text.trim() && !attachedImage)}
              className="w-10 h-10 rounded-full bg-[#4ADE80] hover:bg-[#3ECE77] text-[#07130B] flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#4ADE80] shadow-md shadow-[#4ADE80]/20 cursor-pointer"
              aria-label="Send"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center font-normal">
          {t.disclaimer}
        </p>
      </form>
    </div>
  );
}
