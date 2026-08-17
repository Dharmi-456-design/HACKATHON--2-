import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, Copy, Check, Sparkles, Sun, Bell, User, Image as ImageIcon, Mic, CheckCheck, Globe, ChevronDown, History, Plus, Edit2, Trash2, X, MessageSquare, MicOff, Volume2, Leaf, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, fileToResizedBase64, uploadImage } from '../lib/api';
import { ErrorBanner, FallbackImg } from '../components/ui';
import BlackHole from '../components/BlackHole';

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
  const { toggleTheme, isDark } = useTheme();
  const { session } = useAuth();
  const token = session?.access_token || null;

  const [lang, setLang] = useState(() => localStorage.getItem('pulse_chat_lang') || 'en');
  const [showLangModal, setShowLangModal] = useState(() => !localStorage.getItem('pulse_lang_selected'));
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // File Upload & Speech Recognition state
  const fileInputRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedPayload, setAttachedPayload] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');

  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const endRef = useRef(null);

  const copyMessage = useCallback(async (id, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available or denied
    }
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const localThreadId = () => `local-${Date.now()}`;

  // Load chat threads from the backend on mount (server-side persistence)
  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        if (!token) {
          if (!mounted) return;
          const defaultThread = {
            id: localThreadId(),
            title: 'Ecological Inquiry',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: [],
          };
          setThreads([defaultThread]);
          setActiveThreadId(defaultThread.id);
          setMessages([]);
          setError('Sign in to save your conversations. Chat works, but nothing will be stored.');
          return;
        }
        const list = await apiFetch('/api/pulse/threads', {}, token);
        if (!mounted) return;
        const serverThreads = Array.isArray(list) ? list : [];
        if (serverThreads.length === 0) {
          const created = await apiFetch(
            '/api/pulse/threads',
            { method: 'POST', body: JSON.stringify({ title: 'Ecological Inquiry' }) },
            token
          );
          if (!mounted) return;
          setThreads(created && created.id ? [created] : []);
          setActiveThreadId(created?.id || '');
          setMessages([]);
        } else {
          setThreads(serverThreads);
          const active = serverThreads.find((th) => th.id === activeThreadId) || serverThreads[0];
          setActiveThreadId(active.id);
          setMessages(active.messages || []);
        }
      } catch (err) {
        if (!mounted) return;
        const defaultThread = {
          id: localThreadId(),
          title: 'Ecological Inquiry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [],
        };
        setThreads([defaultThread]);
        setActiveThreadId(defaultThread.id);
        setMessages([]);
        setError('Could not load your chat history. Your conversation will not be saved until the server is reachable.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    boot();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Create the thread on the server when it only exists locally (e.g. the
  // backend was unreachable at load time), then return a server-backed thread.
  const ensureThreadOnServer = async (thread) => {
    if (thread && thread.id && !thread.id.startsWith('local-')) return thread;
    const created = await apiFetch(
      '/api/pulse/threads',
      { method: 'POST', body: JSON.stringify({ title: thread?.title || 'Ecological Inquiry' }) },
      token
    );
    if (created && created.id) {
      setThreads((prev) => prev.map((th) => (th.id === thread.id ? { ...created, messages: thread.messages || [] } : th)));
      setActiveThreadId((prev) => (prev === thread.id ? created.id : prev));
      return { ...created, messages: thread.messages || [] };
    }
    return thread;
  };

  const saveActiveThreadMessages = async (updatedMsgs, targetId = activeThreadId) => {
    // Chat images are transient by design: strip them before persisting so
    // stored threads never balloon with base64 payloads.
    const persistable = updatedMsgs.map(({ image, imageBase64, ...rest }) => rest);
    const currId = targetId || activeThreadId;
    if (!currId) return;

    const firstUserMsg = persistable.find((m) => m.role === 'user')?.content?.trim();
    const autoTitle = firstUserMsg
      ? (firstUserMsg.length > 30 ? firstUserMsg.slice(0, 30) + '…' : firstUserMsg)
      : 'Nature Conversation';

    // Optimistically update local state
    setThreads((prevThreads) => {
      const exists = prevThreads.some((th) => th.id === currId);
      const now = new Date().toISOString();
      let nextThreads;
      if (!exists) {
        const newTh = { id: currId, title: autoTitle, created_at: now, updated_at: now, messages: persistable };
        nextThreads = [newTh, ...prevThreads];
      } else {
        nextThreads = prevThreads.map((th) => {
          if (th.id === currId) {
            const hasCustomTitle =
              th.title &&
              th.title !== 'Ecological Inquiry' &&
              th.title !== 'New Conversation' &&
              th.title !== 'Nature Conversation';
            return {
              ...th,
              title: hasCustomTitle ? th.title : autoTitle,
              updated_at: now,
              messages: persistable,
            };
          }
          return th;
        });
      }
      nextThreads.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      return nextThreads;
    });

    if (!token) return;
    try {
      const target = threads.find((th) => th.id === currId) || { id: currId, title: autoTitle };
      const serverThread = await ensureThreadOnServer(target);
      const saved = await apiFetch(
        `/api/pulse/threads/${serverThread.id}/messages`,
        { method: 'PUT', body: JSON.stringify({ messages: persistable }) },
        token
      );
      if (saved && saved.id) {
        setThreads((prev) => prev.map((th) => (th.id === serverThread.id ? { ...saved, messages: persistable } : th)));
      }
    } catch (err) {
      console.warn('Silent save fallback for thread messages:', err.message);
      setError('');
    }
  };

  const selectLanguage = (code) => {
    setLang(code);
    localStorage.setItem('pulse_chat_lang', code);
    localStorage.setItem('pulse_lang_selected', '1');
    setShowLangModal(false);
    setShowLangDropdown(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WebP, and GIF images are supported.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }
    if (file.size === 0) {
      setError('That file appears to be empty. Please select a valid image.');
      e.target.value = '';
      return;
    }

    try {
      const payload = await fileToResizedBase64(file, 1200);
      setAttachedPayload(payload);
      setAttachedImage(`data:${payload.mime};base64,${payload.base64}`);
      setError('');
    } catch {
      setError('That file could not be read as an image. Please try another one.');
    }
    e.target.value = '';
  };

  // Cleanup Speech Recognition on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Multilingual Voice Input Handler with Animated Modal Popup
  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    setError('');
    setVoiceTranscript(text || '');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      if (lang === 'gu') {
        recognition.lang = 'gu-IN';
      } else if (lang === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }

        const recognizedText = (finalStr + interimStr).trim();
        if (recognizedText) {
          setVoiceTranscript(recognizedText);
          setText(recognizedText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions in your browser.');
          isListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'network' && recognition.lang !== 'en-US') {
          // Fallback to en-US if regional language server is temporarily unreachable
          recognition.lang = 'en-US';
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            isListeningRef.current = false;
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Could not access microphone. Please check your browser audio permissions.');
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const startNewChat = async () => {
    setError('');
    let freshThread = {
      id: localThreadId(),
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };
    if (token) {
      try {
        const created = await apiFetch(
          '/api/pulse/threads',
          { method: 'POST', body: JSON.stringify({ title: 'New Conversation' }) },
          token
        );
        if (created && created.id) freshThread = created;
      } catch {
        setError('');
      }
    } else {
      setError('');
    }
    setThreads((prev) => {
      // Keep only threads that have messages, plus this fresh new thread
      const filtered = prev.filter((th) => th.id !== freshThread.id && th.messages && th.messages.length > 0);
      return [freshThread, ...filtered];
    });
    setActiveThreadId(freshThread.id);
    setMessages([]);
    setText('');
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };

  const loadThread = (threadId) => {
    const th = threads.find((t) => t.id === threadId);
    if (!th) return;
    setActiveThreadId(th.id);
    setMessages(th.messages || []);
    setError('');
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };

  const deleteThread = (e, threadId) => {
    e.stopPropagation();
    const nextThreads = threads.filter((t) => t.id !== threadId);
    setThreads(nextThreads);

    if (token && threadId && !threadId.startsWith('local-')) {
      apiFetch(`/api/pulse/threads/${threadId}`, { method: 'DELETE' }, token).catch(() => {
        setError('');
      });
    }

    if (activeThreadId === threadId) {
      if (nextThreads.length > 0) {
        setActiveThreadId(nextThreads[0].id);
        setMessages(nextThreads[0].messages || []);
      } else {
        startNewChat();
      }
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all conversation history?')) return;
    setError('');
    let freshThread = {
      id: localThreadId(),
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };
    if (token) {
      try {
        await apiFetch('/api/pulse/threads', { method: 'DELETE' }, token);
        const created = await apiFetch(
          '/api/pulse/threads',
          { method: 'POST', body: JSON.stringify({ title: 'New Conversation' }) },
          token
        );
        if (created && created.id) freshThread = created;
      } catch {
        setError('Could not clear your history on the server. Please check your connection.');
      }
    }
    setThreads([freshThread]);
    setActiveThreadId(freshThread.id);
    setMessages([]);
    setText('');
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };

  const clear = () => {
    setMessages([]);
    setText('');
    setAttachedImage(null);
    setAttachedPayload(null);
    setError('');
    if (activeThreadId) {
      saveActiveThreadMessages([], activeThreadId);
    }
  };

  const handleRenameThread = (e, threadId) => {
    e.stopPropagation();
    if (!editTitleText.trim()) return;
    const title = editTitleText.trim();
    setThreads((prev) => prev.map((th) => (th.id === threadId ? { ...th, title } : th)));
    setEditingThreadId(null);
    setEditTitleText('');
    if (token && threadId && !threadId.startsWith('local-')) {
      apiFetch(`/api/pulse/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify({ title }) }, token).catch(() => {
        setError('The conversation could not be renamed on the server. Please check your connection.');
      });
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, busy]);

  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    const content = text.trim();
    if (!content && !attachedImage) return;

    let fullMessageContent = content;
    if (attachedImage && !content) {
      fullMessageContent = '[Attached Image Observation]';
    }

    setText('');
    const capturedPayload = attachedPayload;   // capture before clearing
    const capturedImage   = attachedImage;
    setAttachedImage(null);
    setAttachedPayload(null);
    setBusy(true);
    setError('');

    // Upload image to Cloudinary so it's persistently stored
    let persistentImageUrl = capturedImage || '';
    if (capturedPayload) {
      try {
        const upRes = await uploadImage({
          base64: capturedPayload.base64,
          mime: capturedPayload.mime,
          fileName: 'pulse-chat-image.jpg',
          token,
        });
        if (upRes?.url) persistentImageUrl = upRes.url;
      } catch {
        persistentImageUrl = capturedImage || '';
      }
    }

    const userMsg = {
      id: Date.now(),
      user_id: '',
      role: 'user',
      content: fullMessageContent,
      created_at: new Date().toISOString(),
    };
    if (persistentImageUrl) userMsg.image = persistentImageUrl;

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    saveActiveThreadMessages(newMsgs);

    try {
      let replyData;
      if (capturedPayload) {
        replyData = await apiFetch(
          '/api/pulse',
          {
            method: 'POST',
            body: JSON.stringify({
              message: content,
              imageBase64: capturedPayload.base64,
              contentType: capturedPayload.mime,
              lang,
              thread_id: activeThreadId,
            }),
          },
          token
        );
      } else {
        replyData = await apiFetch(
          '/api/pulse',
          {
            method: 'POST',
            body: JSON.stringify({
              message: content,
              lang,
              thread_id: activeThreadId,
            }),
          },
          token
        );
      }

      const botReply = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyData?.reply || replyData?.content || replyData?.text || 'I observed your request. How else can I help you explore?',
        created_at: new Date().toISOString(),
      };

      const finalMsgs = [...newMsgs, botReply];
      setMessages(finalMsgs);
      saveActiveThreadMessages(finalMsgs);
    } catch {
      setError('Unable to reach Pulse AI. Please check your connection and try again.');
      let replyText = `I observed your note: "${fullMessageContent}". Nature ecosystems respond dynamically to shade canopy, seasonal humidity, and bird nesting corridors.`;
      const isGujarati = lang === 'gu' || /[\u0A80-\u0AFF]/.test(fullMessageContent) || /(vishe|kaho|kem|kya|che|nthi|su|chhe|mate|visit|joiye|kaya|kya|batao|kro)/i.test(fullMessageContent);
      if (isGujarati) {
        const textLower = fullMessageContent.toLowerCase();
        if (textLower.includes('ahmedabad') || textLower.includes('place') || textLower.includes('visit') || textLower.includes('જોવા') || textLower.includes('સ્થાન') || textLower.includes('જગ્યા') || textLower.includes('ફરવા') || textLower.includes('ક્યાં')) {
          replyText = 'અમદાવાદ અને આસપાસ મુલાકાત લેવા માટેના શ્રેષ્ઠ ૪ પ્રકૃતિ સ્થાનો:\n૧. સાબરમતી રિવરસાઇડ પાર્ક — નદી કિનારે પક્ષી દર્શન અને શાંતિ માટે\n૨. થોળ સરોવર પક્ષી અભયારણ્ય — ફ્લેમિંગો અને મિગ્રેટરી જળચરો માટે\n૩. પરિમલ ગાર્ડન — પ્રાચીન વડ અને બોટનિકલ ક્રેસ્ટ માટે\n૪. ઇન્દ્રોડા નેચર હેરિટેજ પાર્ક (ગાંધીનગર) — વિશાળ ફોરેસ્ટ ટ્રાયલ માટે\n\nતમે આમાંથી કયા સ્થાન વિશે વધુ વિગત જાણવા માંગો છો?';
        } else if (textLower.includes('bird') || textLower.includes('પક્ષી') || textLower.includes('pakshi') || textLower.includes('મોર') || textLower.includes('પોપટ')) {
          replyText = 'ગુજરાત અને અમદાવાદમાં મોર (Peafowl), પોપટ (Parakeet), એશિયન કોયલ (Koel), શ્વેત બગલા (Egrets) અને લીલો પતંગો (Bee-Eater) મુખ્યત્વે જોવા મળે છે. તમે કયા પક્ષી વિશે વધુ વિગત જાણવા માગો છો?';
        } else if (textLower.includes('tree') || textLower.includes('વૃક્ષ') || textLower.includes('છોડ') || textLower.includes('vruksh') || textLower.includes('plant') || textLower.includes('flower') || textLower.includes('ફૂલ')) {
          replyText = 'તમારી આસપાસ પવિત્ર વડ (Banyan Tree), ઔષધીય લીમડો (Neem), પીપળો (Peepal) અને અમલતાસ (Golden Shower) મુખ્ય ઓક્સિજન આપતા વૃક્ષો છે. તમે કયા વૃક્ષ કે ફૂલ વિશે પૂછવા માંગો છો?';
        } else if (textLower.includes('hi') || textLower.includes('hello') || textLower.includes('kem cho') || textLower.includes('કેમ') || textLower.includes('નામ') || textLower.includes('કોણ')) {
          replyText = 'નમસ્તે! 🍃 હું પલ્સ (Pulse AI) છું — તમારો ઇકોલોજીકલ ગાઇડ. તમે મને અમદાવાદના સ્થાનો, પક્ષીઓ, વૃક્ષો, વાતાવરણ અથવા પર્યાવરણ વિશે ગમે તે પ્રશ્ન પૂછી શકો છો!';
        } else {
          replyText = `તમારા પ્રશ્ન "${fullMessageContent}" માટે પલ્સ ઇન્ટેલિજન્સ:\nપલ્સ એઆઈ તમારી આસપાસના પર્યાવરણ, જૈવવિવિધતા, અમદાવાદના સ્થાનો અને વનસ્પતિઓ વિશે સચોટ માહિતી આપે છે. તમે કયા ચોક્કસ વિષય કે પ્રજાતિ વિશે વધુ વિગત જાણવા માગો છો?`;
        }
      } else if (lang === 'hi' || /[\u0900-\u097F]/.test(fullMessageContent)) {
        replyText = `आपके प्रश्न "${fullMessageContent}" के लिए पल्स उत्तर: आपके आस-पास के पौधों और पक्षियों के बारे में पल्स इंटेलिजेंस सीधा उत्तर देता है।`;
      }
      const fallbackReply = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`h-[calc(100vh-2rem)] md:h-screen w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 flex flex-col overflow-hidden font-sans selection:bg-[#4ADE80]/30 selection:text-white relative gpu-layer transition-colors duration-300 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0A1610]/80 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#4ADE80]/30 border-t-[#4ADE80] animate-spin" />
        </div>
      )}
      {/* ──────────────── 3D BLACK HOLE BACKGROUND ACCRETION DISK ──────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 sm:opacity-55 overflow-hidden">
        <BlackHole
          particleCount={758}
          particleSize={1}
          orbitSpeed={1}
          outerRadius={100}
          tilt={20}
          tiltSideway={160}
          showCenter={true}
          colors={isDark ? ['#4ADE80', '#22C55E', '#A7F3D0', '#ffffff', '#15803D'] : ['#183B28', '#2D5A3F', '#4ADE80', '#15803D', '#3E5C48']}
        />
      </div>
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 20 }}
              className={`border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 relative overflow-hidden transition-colors ${
                isDark ? 'bg-[#112318] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4ADE80]/20 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

              <div className="space-y-2">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#4ADE80]/30 blur-md"
                  />
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-lg relative z-10 ${
                    isDark ? 'bg-gradient-to-br from-[#2E6141] to-[#0A180F] border-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28]'
                  }`}>
                    <Mic className={`w-9 h-9 animate-bounce ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`} />
                  </div>
                </div>

                <h3 className={`font-display text-2xl font-bold tracking-tight pt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.listeningTitle}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.listeningHint}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  🌐 {t.langName} Mode ({lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-US'})
                </span>
              </div>

              {/* Live Transcribed Speech Preview Box */}
              <div className={`border rounded-2xl p-5 min-h-[110px] flex flex-col items-center justify-center text-center transition-all ${
                isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
              }`}>
                {(voiceTranscript || text) ? (
                  <div className="space-y-1">
                    <p className={`text-base sm:text-lg font-medium leading-relaxed ${
                      isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                    }`}>
                      "{voiceTranscript || text}"
                    </p>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Live Speech Transcription Active
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className={`text-sm sm:text-base font-normal animate-pulse ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Listening to your voice… Start speaking now!
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      (Your spoken words will appear here in real-time)
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Soundwave Visualizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[0.1, 0.3, 0.15, 0.45, 0.2, 0.5, 0.25, 0.4].map((delay, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: (voiceTranscript || text) ? ['12px', '36px', '16px', '32px', '12px'] : ['6px', '18px', '8px', '14px', '6px'] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-moss via-sage to-[#4ADE80]"
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center gap-2 ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                  }`}
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden transition-colors ${
              isDark ? 'bg-[#112318] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
            }`}>
              <div className="text-center space-y-2">
                <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center text-xl ${
                  isDark ? 'bg-[#1A3827] border-[#2D5A3F]' : 'bg-[#E1EFE0] border-[#C3DEC0]'
                }`}>
                  🌐
                </div>
                <h2 className={`font-display text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.modalTitle}
                </h2>
                <p className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                        ? isDark
                          ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                        : isDark
                          ? 'bg-[#13271C]/70 border-[#20422E] text-slate-300 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{l.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-sm leading-snug">{l.native}</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{l.name}</p>
                      </div>
                    </div>
                    {lang === l.code && (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white'
                      }`}>
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
              className={`w-full max-w-sm h-full border-l p-5 shadow-2xl flex flex-col justify-between transition-colors ${
                isDark ? 'bg-[#0E1F14] border-[#20452F] text-white' : 'bg-[#FAF7F0] border-[#E3DDD1] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? 'border-[#20452F]' : 'border-slate-200'
                }`}>
                  <div className={`flex items-center gap-2 font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <History className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`} />
                    <span>{t.historyTitle}</span>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    aria-label="Close history"
                    className={`p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1A3827]' : 'text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#EDE6D8]'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={startNewChat}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-medium text-sm transition-all cursor-pointer shadow-md ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#1C3727] text-white hover:bg-[#2A4E38]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newChat}</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroll">
                  {!threads.length ? (
                    <p className={`text-xs py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.noHistory}</p>
                  ) : (
                    threads.map((th) => (
                      <div
                        key={th.id}
                        onClick={() => loadThread(th.id)}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                          activeThreadId === th.id
                            ? isDark
                              ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md'
                              : 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                            : isDark
                              ? 'bg-[#13271C]/60 border-[#20422E] text-slate-300 hover:bg-[#173022]'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`} />
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
                                className={`border px-2 py-0.5 rounded text-xs outline-none w-full ${
                                  isDark ? 'bg-[#0E2015] border-[#4ADE80] text-white' : 'bg-[#FDFBF7] border-[#183B28] text-[#0F2418]'
                                }`}
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
                              className={`p-1 rounded ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#254B35]' : 'text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#EDE6D8]'}`}
                              title="Rename"
                              aria-label="Rename thread"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => deleteThread(e, th.id)}
                              className={`p-1 rounded hover:text-red-500 ${isDark ? 'text-slate-400 hover:bg-[#254B35]' : 'text-[#3E5C48] hover:bg-[#EDE6D8]'}`}
                              title="Delete"
                              aria-label="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className={`text-[10px] mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {th.messages?.length
                            ? th.messages[th.messages.length - 1].content
                            : 'No messages yet'}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {threads.some((th) => th.messages && th.messages.length > 0) && (
                  <div className={`pt-3 border-t flex items-center justify-between ${
                    isDark ? 'border-[#20452F]' : 'border-slate-200'
                  }`}>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {threads.filter((th) => th.messages && th.messages.length > 0).length} conversations
                    </span>
                    <button
                      onClick={clearAllHistory}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── TOP HERO BANNER CARD ──────────────── */}
      <div className={`shrink-0 relative rounded-2xl sm:rounded-3xl p-4 sm:p-9 min-h-[100px] sm:min-h-[175px] shadow-2xl overflow-hidden backdrop-blur-xl border transition-colors ${
        isDark ? 'bg-[#112318]/90 border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-md'
      }`}>
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-1.5 sm:gap-2.5 z-20">
          <button
            onClick={startNewChat}
            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-sm font-semibold transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 ${
              isDark ? 'bg-[#4ADE80] hover:bg-[#3ECE77] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
            }`}
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            onClick={() => setShowHistoryDrawer(true)}
            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border flex items-center gap-1.5 text-[10px] sm:text-sm font-medium transition-colors cursor-pointer ${
              isDark ? 'bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-100' : 'bg-[#F2ECE1] hover:bg-[#EDE6D8] border-[#E0D8C8] text-[#183B28]'
            }`}
            title="Chat History"
          >
            <History className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`} />
            <span className="hidden sm:inline">Chat History</span>
            {threads.filter((th) => th.messages?.length > 0).length > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                isDark ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
              }`}>
                {threads.filter((th) => th.messages?.length > 0).length}
              </span>
            )}
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowLangDropdown((v) => !v)}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isDark ? 'bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-100' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Change Language"
            >
              <Globe className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`} />
              <span>{t.langName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={`absolute right-0 mt-2 w-40 rounded-2xl p-1.5 shadow-2xl z-30 space-y-1 border ${
                    isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                  }`}
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${
                        lang === l.code
                          ? isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28] font-bold'
                          : isDark ? 'text-slate-300 hover:bg-[#1A3827]/60 hover:text-white' : 'text-[#3E5C48] hover:bg-[#F2ECE1]'
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
            className={`hidden sm:flex w-9 h-9 rounded-full border items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-300 hover:text-white' : 'bg-[#F2ECE1] hover:bg-[#EDE6D8] border-[#E0D8C8] text-[#183B28]'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          
          <button
            title="Notifications"
            className={`hidden sm:flex w-9 h-9 rounded-full border items-center justify-center transition-colors cursor-pointer relative ${
              isDark ? 'bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="relative hidden sm:block">
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
              isDark ? 'bg-[#1A3626] border-[#2D5A3F] text-slate-200' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#183B28]'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
              isDark ? 'bg-[#4ADE80] border-[#112318]' : 'bg-emerald-600 border-white'
            }`} />
          </div>

          <button
            onClick={clear}
            className={`hidden sm:flex ml-1 text-xs items-center gap-1 transition-colors cursor-pointer ${
              isDark ? 'text-emerald-400/80 hover:text-emerald-400' : 'text-[#183B28] hover:text-[#0F2418] font-semibold'
            }`}
            title="Clear Thread"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <LeafBranchHeader />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pr-0 md:pr-40">
          <div className="hidden sm:block"><EkgPulseOrb size={84} active={busy} /></div>
          <div className="sm:hidden"><EkgPulseOrb size={52} active={busy} /></div>

          <div className="space-y-1">
            <p className={`text-xs sm:text-sm font-medium tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Welcome to</p>
            <h1 className={`font-display text-4xl sm:text-5xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Pulse <Leaf className="w-8 h-8 text-[#4ADE80] shrink-0" />
            </h1>

            <div className={`text-sm sm:text-base leading-relaxed font-normal pt-0.5 ${isDark ? 'text-slate-200/90' : 'text-slate-600'}`}>
              <p>Calm, encouraging, intelligent, practical.</p>
              <p>Never a know-it-all.</p>
            </div>

            <div className={`hidden sm:flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Live Neural Sensing</span>
              </div>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Your Ecological Guide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── DATE DIVIDER ──────────────── */}
      <div className="shrink-0 flex justify-center my-3 relative z-10">
        <span className={`px-4 py-1 rounded-full text-xs tracking-wider border ${
          isDark ? 'bg-[#122519] border-[#20452F] text-slate-400' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#3E5C48] shadow-xs'
        }`}>
          {todayDateString}
        </span>
      </div>

      {/* ──────────────── CHAT MESSAGES THREAD ──────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-1.5 custom-chat-scroll relative z-10">
        {busy && (
          <div className={`flex items-center justify-center py-10 gap-3 text-sm ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
            <EkgPulseOrb size={34} active={true} />
            <span className="animate-pulse">{t.notebookLoading}</span>
          </div>
        )}

        {!busy && !messages.length && (
              <div className="flex items-start gap-3.5 justify-start max-w-full">
                <div className="hidden sm:block"><EkgPulseOrb size={40} /></div>
                <div className="sm:hidden shrink-0"><EkgPulseOrb size={30} /></div>
                <div className={`max-w-[90%] sm:max-w-lg border-l-4 rounded-2xl rounded-tl-xs p-3.5 sm:p-4.5 shadow-md space-y-2 relative border ${
              isDark
                ? 'bg-[#13271C] border-[#20422E] border-l-[#4ADE80] text-slate-100'
                : 'bg-[#FDFBF7] border-[#E3DDD1] border-l-[#183B28] text-[#0F2418]'
            }`}>
              <p className="text-base font-medium leading-relaxed pr-4">
                {t.welcomeBotMsg1}
              </p>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                {t.welcomeBotMsg2}
              </p>
              <p className={`text-xs text-right pt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{formatTime()}</p>
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
                  className={`relative w-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-sm sm:text-base leading-relaxed shadow-md ${
                    m.role === 'user'
                      ? isDark
                        ? 'bg-[#1A3827] border border-[#2D5A3F] text-white rounded-2xl rounded-tr-xs'
                        : 'bg-[#183B28] border border-[#183B28] text-[#FAF7F0] rounded-2xl rounded-tr-xs'
                      : isDark
                        ? 'bg-[#13271C] border border-[#20422E] border-l-4 border-l-[#4ADE80] text-slate-100 rounded-2xl rounded-tl-xs'
                        : 'bg-[#FDFBF7] border border-[#E3DDD1] border-l-4 border-l-[#183B28] text-[#0F2418] rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {m.image && (
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide mb-1.5 font-semibold ${
                        isDark ? 'text-[#4ADE80]' : 'text-emerald-700'
                      }`}>
                        <ImageIcon className="w-3 h-3" />
                        Image attached
                      </span>
                      <FallbackImg
                        src={m.image}
                        alt="Attached observation"
                        className="rounded-xl max-h-48 w-auto object-cover border border-[#4ADE80]/40"
                      />
                    </div>
                  )}
                  <div className={m.role !== 'user' ? 'pr-6' : ''}>{m.content}</div>

                  {m.role !== 'user' && (
                    <button
                      onClick={() => copyMessage(m.id, m.content)}
                      className={`absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-[#1A3827]' : 'text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#F2ECE1]'
                      }`}
                      title="Copy message"
                    >
                      {copiedId === m.id ? <Check className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-600'}`} /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 px-1">
                  <span>{formatTime(m.created_at)}</span>
                  {m.role === 'user' && <CheckCheck className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-600'}`} />}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>

        {/* Thinking State */}
        {busy && (
          <div className="space-y-1.5">
            <div className={`flex items-center gap-2 text-xs sm:text-sm pl-1 font-medium ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`}>
              <svg viewBox="0 0 100 100" className="w-4 h-4">
                <path d="M 10 50 L 35 50 L 45 25 L 55 75 L 65 40 L 75 55 L 90 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <span>{t.thinking}</span>
              <span className={`w-2 h-2 rounded-full animate-ping ${isDark ? 'bg-[#4ADE80]' : 'bg-emerald-600'}`} />
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
      <form onSubmit={send} className="shrink-0 pt-2 pb-[env(safe-area-inset-bottom,8px)] space-y-1.5 relative z-10">
        {/* Thumbnail Preview for Image Attachment */}
        {attachedImage && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl w-fit border ${
            isDark ? 'bg-[#12241A] border-[#234A33]' : 'bg-[#F2ECE1] border-[#E0D8C8] shadow-xs'
          }`}>
            <FallbackImg src={attachedImage} alt="Attachment" className="w-8 h-8 rounded object-cover border border-[#4ADE80]/40" />
            <div className="flex flex-col min-w-0">
              <span className={`text-xs truncate max-w-[160px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {attachedPayload?.name || 'Image attached'}
              </span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ready to send</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedImage(null);
                setAttachedPayload(null);
                setError('');
              }}
              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
              title="Remove image"
              aria-label="Remove attached image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className={`relative rounded-full p-1.5 sm:p-2 pl-3 sm:pl-6 shadow-2xl flex items-center gap-2 sm:gap-3 backdrop-blur-xl transition-all border ${
          isDark
            ? 'bg-[#12241A]/95 border-[#234A33] focus-within:border-[#4ADE80]/70 focus-within:ring-2 focus-within:ring-[#4ADE80]/20'
            : 'bg-[#FDFBF7] border-[#E0D8C8] focus-within:border-[#183B28] focus-within:ring-2 focus-within:ring-[#183B28]/20 shadow-lg'
        }`}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className={`flex-1 bg-transparent text-sm sm:text-base outline-none font-normal ${
              isDark ? 'text-white placeholder:text-slate-500' : 'text-[#0F2418] placeholder:text-[#4F6856]'
            }`}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Image File Picker Button */}
            <button
              type="button"
              onClick={handleImageClick}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-[#1C3A29]' : 'text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#F2ECE1]'
              }`}
              title="Attach Image / Observation"
              aria-label="Attach an image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Multilingual Voice Speech-to-Text Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 text-red-500 animate-pulse'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1C3A29]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={busy || (!text.trim() && !attachedImage)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 shadow-md cursor-pointer ${
                isDark ? 'bg-[#4ADE80] hover:bg-[#3ECE77] text-[#07130B] shadow-[#4ADE80]/20' : 'bg-[#183B28] hover:bg-[#255239] text-[#FAF7F0]'
              }`}
              aria-label="Send"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        <p className={`text-xs text-center font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {t.disclaimer}
        </p>
      </form>
    </div>
  );
}
