import { useCallback, useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Copy, Check, Sparkles, Sun, Bell, User, Image as ImageIcon, Mic, CheckCheck, Globe, ChevronDown, History, Plus, Edit2, Trash2, X, MessageSquare, MicOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch, fileToResizedBase64 } from "../lib/api";
import { ErrorBanner } from "../components/ui";
const TRANSLATIONS = {
  en: {
    welcome: "Welcome to",
    title: "Pulse",
    tagline1: "Calm, encouraging, intelligent, practical.",
    tagline2: "Never a know-it-all.",
    badge1: "Live Neural Sensing",
    badge2: "Your Ecological Guide",
    clearThread: "Clear thread",
    historyTitle: "Chat History",
    newChat: "New Chat",
    welcomeBotMsg1: "Hi there! \u{1F343} I'm Pulse, your ecological guide.",
    welcomeBotMsg2: "Tell me about your surroundings today or what species you are curious about.",
    inputPlaceholder: "Ask Pulse about what is around you...",
    thinking: "Pulse is thinking...",
    notebookLoading: "Opening field notebook\u2026",
    disclaimer: "Pulse AI can make mistakes. Please verify important information.",
    modalTitle: "Choose Your Language",
    modalSubtitle: "Select how Pulse should communicate with you.",
    langName: "English",
    langFlag: "\u{1F1EC}\u{1F1E7}",
    noHistory: "No previous conversations saved yet.",
    listening: "Listening\u2026 speak now",
    listeningTitle: "Pulse Neural Voice Input",
    listeningHint: "Speak naturally in English, Gujarati, or Hindi",
    doneListening: "Done Listening"
  },
  gu: {
    welcome: "\u0AB8\u0ACD\u0AB5\u0ABE\u0A97\u0AA4 \u0A9B\u0AC7",
    title: "\u0AAA\u0AB2\u0ACD\u0AB8",
    tagline1: "\u0AB6\u0ABE\u0A82\u0AA4, \u0AAA\u0ACD\u0AB0\u0ACB\u0AA4\u0ACD\u0AB8\u0ABE\u0AB9\u0A95, \u0AAC\u0AC1\u0AA6\u0ACD\u0AA7\u0ABF\u0AB6\u0ABE\u0AB3\u0AC0, \u0AB5\u0ACD\u0AAF\u0AB5\u0AB9\u0ABE\u0AB0\u0AC1.",
    tagline2: "\u0A95\u0ACD\u0AAF\u0ABE\u0AB0\u0AC7\u0AAF \u0A9C\u0ACD\u0A9E\u0ABE\u0AA8\u0AC0 \u0AA8\u0AA5\u0AC0.",
    badge1: "\u0AB2\u0ABE\u0A88\u0AB5 \u0AA8\u0ACD\u0AAF\u0AC1\u0AB0\u0AB2 \u0AB8\u0AC7\u0AA8\u0ACD\u0AB8\u0ABF\u0A82\u0A97",
    badge2: "\u0AA4\u0AAE\u0ABE\u0AB0\u0AC1\u0A82 \u0A87\u0A95\u0ACB\u0AB2\u0ACB\u0A9C\u0AC0\u0A95\u0AB2 \u0A97\u0ABE\u0A87\u0AA1",
    clearThread: "\u0AA5\u0ACD\u0AB0\u0AC7\u0AA1 \u0AB8\u0ABE\u0AAB \u0A95\u0AB0\u0ACB",
    historyTitle: "\u0AB5\u0ABE\u0AA4\u0A9A\u0AC0\u0AA4\u0AA8\u0ACB \u0A87\u0AA4\u0ABF\u0AB9\u0ABE\u0AB8",
    newChat: "\u0AA8\u0AB5\u0AC0 \u0A9A\u0AC7\u0A9F",
    welcomeBotMsg1: "\u0AA8\u0AAE\u0AB8\u0ACD\u0AA4\u0AC7! \u{1F343} \u0AB9\u0AC1\u0A82 \u0AAA\u0AB2\u0ACD\u0AB8 \u0A9B\u0AC1\u0A82, \u0AA4\u0AAE\u0ABE\u0AB0\u0ACB \u0A87\u0A95\u0ACB\u0AB2\u0ACB\u0A9C\u0AC0\u0A95\u0AB2 \u0A97\u0ABE\u0A87\u0AA1.",
    welcomeBotMsg2: "\u0A86\u0A9C\u0AC7 \u0AA4\u0AAE\u0ABE\u0AB0\u0AC0 \u0A86\u0AB8\u0AAA\u0ABE\u0AB8\u0AA8\u0ABE \u0AB5\u0ABE\u0AA4\u0ABE\u0AB5\u0AB0\u0AA3 \u0AB5\u0ABF\u0AB6\u0AC7 \u0A85\u0AA5\u0AB5\u0ABE \u0AA4\u0AAE\u0AC7 \u0A95\u0A88 \u0AAA\u0ACD\u0AB0\u0A9C\u0ABE\u0AA4\u0ABF \u0AB5\u0ABF\u0AB6\u0AC7 \u0A89\u0AA4\u0ACD\u0AB8\u0AC1\u0A95 \u0A9B\u0ACB \u0AA4\u0AC7 \u0AAE\u0AA8\u0AC7 \u0A9C\u0AA3\u0ABE\u0AB5\u0ACB.",
    inputPlaceholder: "\u0AA4\u0AAE\u0ABE\u0AB0\u0AC0 \u0A86\u0AB8\u0AAA\u0ABE\u0AB8 \u0AB6\u0AC1\u0A82 \u0A9B\u0AC7 \u0AA4\u0AC7 \u0AB5\u0ABF\u0AB6\u0AC7 \u0AAA\u0AB2\u0ACD\u0AB8\u0AA8\u0AC7 \u0AAA\u0AC2\u0A9B\u0ACB...",
    thinking: "\u0AAA\u0AB2\u0ACD\u0AB8 \u0AB5\u0ABF\u0A9A\u0ABE\u0AB0\u0AC0 \u0AB0\u0AB9\u0ACD\u0AAF\u0AC1\u0A82 \u0A9B\u0AC7...",
    notebookLoading: "\u0AAB\u0ABF\u0AB2\u0ACD\u0AA1 \u0AA8\u0ACB\u0A9F\u0AAC\u0AC1\u0A95 \u0A96\u0ACB\u0AB2\u0AC0 \u0AB0\u0AB9\u0ACD\u0AAF\u0AC1\u0A82 \u0A9B\u0AC7\u2026",
    disclaimer: "Pulse AI \u0AAD\u0AC2\u0AB2\u0ACB \u0A95\u0AB0\u0AC0 \u0AB6\u0A95\u0AC7 \u0A9B\u0AC7. \u0A95\u0AC3\u0AAA\u0ABE \u0A95\u0AB0\u0AC0\u0AA8\u0AC7 \u0AAE\u0AB9\u0AA4\u0ACD\u0AB5\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0AAE\u0ABE\u0AB9\u0ABF\u0AA4\u0AC0 \u0A9A\u0A95\u0ABE\u0AB8\u0ACB.",
    modalTitle: "\u0AA4\u0AAE\u0ABE\u0AB0\u0AC0 \u0AAD\u0ABE\u0AB7\u0ABE \u0AAA\u0AB8\u0A82\u0AA6 \u0A95\u0AB0\u0ACB",
    modalSubtitle: "\u0AAA\u0AB2\u0ACD\u0AB8 \u0AA4\u0AAE\u0ABE\u0AB0\u0AC0 \u0AB8\u0ABE\u0AA5\u0AC7 \u0A95\u0AC7\u0AB5\u0AC0 \u0AB0\u0AC0\u0AA4\u0AC7 \u0AB5\u0ABE\u0AA4\u0A9A\u0AC0\u0AA4 \u0A95\u0AB0\u0AC7 \u0AA4\u0AC7 \u0AAA\u0AB8\u0A82\u0AA6 \u0A95\u0AB0\u0ACB.",
    langName: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
    langFlag: "\u{1F1EE}\u{1F1F3}",
    noHistory: "\u0AB9\u0A9C\u0AC1 \u0AB8\u0AC1\u0AA7\u0AC0 \u0A95\u0ACB\u0A88 \u0A9C\u0AC2\u0AA8\u0AC0 \u0AB5\u0ABE\u0AA4\u0A9A\u0AC0\u0AA4 \u0AB8\u0A82\u0A97\u0ACD\u0AB0\u0AB9\u0ABF\u0AA4 \u0AA8\u0AA5\u0AC0.",
    listening: "\u0AB8\u0ABE\u0A82\u0AAD\u0AB3\u0AC0 \u0AB0\u0AB9\u0ACD\u0AAF\u0AC1\u0A82 \u0A9B\u0AC7\u2026 \u0AAC\u0ACB\u0AB2\u0ACB",
    listeningTitle: "\u0AAA\u0AB2\u0ACD\u0AB8 \u0AB5\u0AC9\u0A87\u0AB8 \u0AB2\u0ABF\u0AB8\u0AA8\u0ABF\u0A82\u0A97",
    listeningHint: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0, \u0AB9\u0ABF\u0AA8\u0ACD\u0AA6\u0AC0 \u0A95\u0AC7 \u0A85\u0A82\u0A97\u0ACD\u0AB0\u0AC7\u0A9C\u0AC0\u0AAE\u0ABE\u0A82 \u0AAC\u0ACB\u0AB2\u0ACB",
    doneListening: "\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0AA5\u0AAF\u0AC1\u0A82"
  },
  hi: {
    welcome: "\u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948",
    title: "\u092A\u0932\u094D\u0938",
    tagline1: "\u0936\u093E\u0902\u0924, \u0909\u0924\u094D\u0938\u093E\u0939\u0935\u0930\u094D\u0927\u0915, \u092C\u0941\u0926\u094D\u0927\u093F\u092E\u093E\u0928, \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915\u0964",
    tagline2: "\u0915\u092D\u0940 \u092D\u0940 \u0938\u0930\u094D\u0935\u091C\u094D\u091E\u093E\u0924\u093E \u0928\u0939\u0940\u0902\u0964",
    badge1: "\u0932\u093E\u0907\u0935 \u0928\u094D\u092F\u0942\u0930\u0932 \u0938\u0947\u0902\u0938\u093F\u0902\u0917",
    badge2: "\u0906\u092A\u0915\u093E \u0907\u0915\u094B\u0932\u0949\u091C\u093F\u0915\u0932 \u0917\u093E\u0907\u0921",
    clearThread: "\u0925\u094D\u0930\u0947\u0921 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
    historyTitle: "\u092C\u093E\u0924\u091A\u0940\u0924 \u0915\u093E \u0907\u0924\u093F\u0939\u093E\u0938",
    newChat: "\u0928\u092F\u0940 \u091A\u0948\u091F",
    welcomeBotMsg1: "\u0928\u092E\u0938\u094D\u0924\u0947! \u{1F343} \u092E\u0948\u0902 \u092A\u0932\u094D\u0938 \u0939\u0942\u0901, \u0906\u092A\u0915\u093E \u0907\u0915\u094B\u0932\u0949\u091C\u093F\u0915\u0932 \u0917\u093E\u0907\u0921\u0964",
    welcomeBotMsg2: "\u0906\u091C \u0905\u092A\u0928\u0947 \u092A\u0930\u093F\u0935\u0947\u0936 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092F\u093E \u091C\u093F\u0928 \u092A\u094D\u0930\u091C\u093E\u0924\u093F\u092F\u094B\u0902 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0906\u092A \u0909\u0924\u094D\u0938\u0941\u0915 \u0939\u0948\u0902, \u0909\u0928\u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092E\u0941\u091D\u0947 \u092C\u0924\u093E\u090F\u0902\u0964",
    inputPlaceholder: "\u0905\u092A\u0928\u0947 \u0906\u0938-\u092A\u093E\u0938 \u0915\u0947 \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0932\u094D\u0938 \u0938\u0947 \u092A\u0942\u091B\u0947\u0902...",
    thinking: "\u092A\u0932\u094D\u0938 \u0938\u094B\u091A \u0930\u0939\u093E \u0939\u0948...",
    notebookLoading: "\u092B\u0940\u0932\u094D\u0921 \u0928\u094B\u091F\u092C\u0941\u0915 \u0916\u094B\u0932\u0940 \u091C\u093E \u0930\u0939\u0940 \u0939\u0948\u2026",
    disclaimer: "Pulse AI \u0917\u0932\u0924\u093F\u092F\u093E\u0902 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0915\u0930\u0947\u0902\u0964",
    modalTitle: "\u0905\u092A\u0928\u0940 \u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902",
    modalSubtitle: "\u091A\u0941\u0928\u0947\u0902 \u0915\u093F \u092A\u0932\u094D\u0938 \u0906\u092A\u0915\u0947 \u0938\u093E\u0925 \u0915\u0948\u0938\u0947 \u0938\u0902\u0935\u093E\u0926 \u0915\u0930\u0947\u0964",
    langName: "\u0939\u093F\u0902\u0926\u0940",
    langFlag: "\u{1F1EE}\u{1F1F3}",
    noHistory: "\u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u092A\u0941\u0930\u093E\u0928\u0940 \u092C\u093E\u0924\u091A\u0940\u0924 \u0938\u0939\u0947\u091C\u0940 \u0928\u0939\u0940\u0902 \u0917\u0908 \u0939\u0948\u0964",
    listening: "\u0938\u0941\u0928 \u0930\u0939\u093E \u0939\u0948\u2026 \u0905\u092C \u092C\u094B\u0932\u0947\u0902",
    listeningTitle: "\u092A\u0932\u094D\u0938 \u0935\u0949\u0907\u0938 \u0932\u093F\u0938\u0928\u093F\u0902\u0917",
    listeningHint: "\u0939\u093F\u0902\u0926\u0940, \u0917\u0941\u091C\u0930\u093E\u0924\u0940 \u092F\u093E \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u092E\u0947\u0902 \u092C\u094B\u0932\u0947\u0902",
    doneListening: "\u0939\u094B \u0917\u092F\u093E"
  }
};
const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "gu", name: "Gujarati", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "hi", name: "Hindi", native: "\u0939\u093F\u0902\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" }
];
function EkgPulseOrb({ size = 84, active = false }) {
  return /* @__PURE__ */ React.createElement("div", { className: "relative inline-flex items-center justify-center shrink-0 gpu-layer", style: { width: size, height: size } }, /* @__PURE__ */ React.createElement(
    motion.span,
    {
      animate: active ? { scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4] } : { scale: [0.96, 1.1, 0.96], opacity: [0.35, 0.65, 0.35] },
      transition: { duration: active ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" },
      className: "absolute inset-0 rounded-full bg-[#4ADE80]/30 blur-md"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-[3%] rounded-full bg-gradient-to-br from-[#2E6141] via-[#163321] to-[#0A180F] p-[2px] shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "w-full h-full rounded-full bg-[#0E2015] flex items-center justify-center relative overflow-hidden border border-[#3E7D55]/60" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 100", className: "w-4/5 h-4/5 relative z-10" }, /* @__PURE__ */ React.createElement(
    motion.path,
    {
      d: "M 10 50 L 30 50 L 37 32 L 45 68 L 53 20 L 61 78 L 69 40 L 76 54 L 82 50 L 90 50",
      fill: "none",
      stroke: "#4ADE80",
      strokeWidth: "4.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      animate: active ? { opacity: [0.5, 1, 0.5] } : { opacity: [0.8, 1, 0.8] },
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
      style: { filter: "drop-shadow(0 0 8px #4ADE80)" }
    }
  )))));
}
function LeafBranchHeader() {
  return /* @__PURE__ */ React.createElement("div", { className: "absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden hidden md:block select-none" }, [...Array(8)].map((_, i) => /* @__PURE__ */ React.createElement(
    "span",
    {
      key: i,
      className: "absolute rounded-full bg-[#E6C176] animate-pulse",
      style: {
        width: 3 + i % 3 * 2,
        height: 3 + i % 3 * 2,
        right: `${15 + i * 9 % 35}%`,
        top: `${20 + i * 11 % 60}%`,
        boxShadow: "0 0 8px #E6C176",
        animationDuration: `${2 + i % 3}s`
      }
    }
  )), /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 320 220", className: "absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-75" }, /* @__PURE__ */ React.createElement("path", { d: "M 240 220 Q 200 130 130 30", fill: "none", stroke: "#1D452B", strokeWidth: "4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M 130 30 Q 150 10 175 22 Q 150 45 130 30", fill: "#285C3A", stroke: "#3D8254", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M 150 60 Q 185 45 205 60 Q 160 85 150 60", fill: "#1C452A", stroke: "#316B45", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M 175 95 Q 215 80 235 100 Q 200 125 175 95", fill: "#2C6942", stroke: "#489A63", strokeWidth: "1.5" })));
}
function BouncingDots() {
  return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-2.5 bg-[#13271C] border border-[#20422E] rounded-2xl rounded-tl-xs shadow-xs" }, [0, 0.15, 0.3].map((delay, i) => /* @__PURE__ */ React.createElement(
    motion.span,
    {
      key: i,
      animate: { y: [0, -4, 0], opacity: [0.5, 1, 0.5] },
      transition: { duration: 0.6, repeat: Infinity, delay },
      className: "w-2 h-2 rounded-full bg-[#4ADE80]"
    }
  )));
}
const STARTERS = [
  "What bird is singing outside my window?",
  "I have 5 minutes \u2014 what should I notice?",
  "Why do leaves change color in autumn?",
  "What lives in the moss on my garden wall?"
];
export default function PulseChat() {
  const { toggleTheme, isDark } = useTheme();
  const { session } = useAuth();
  const token = session?.access_token || null;
  const [lang, setLang] = useState(() => localStorage.getItem("pulse_chat_lang") || "en");
  const [showLangModal, setShowLangModal] = useState(() => !localStorage.getItem("pulse_lang_selected"));
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const fileInputRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedPayload, setAttachedPayload] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const endRef = useRef(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const todayDateString = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : /* @__PURE__ */ new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const localThreadId = () => `local-${Date.now()}`;
  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        if (!token) {
          if (!mounted) return;
          const defaultThread = {
            id: localThreadId(),
            title: "Ecological Inquiry",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString(),
            messages: []
          };
          setThreads([defaultThread]);
          setActiveThreadId(defaultThread.id);
          setMessages([]);
          setError("Sign in to save your conversations. Chat works, but nothing will be stored.");
          return;
        }
        const list = await apiFetch("/api/pulse/threads", {}, token);
        if (!mounted) return;
        const serverThreads = Array.isArray(list) ? list : [];
        if (serverThreads.length === 0) {
          const created = await apiFetch(
            "/api/pulse/threads",
            { method: "POST", body: JSON.stringify({ title: "Ecological Inquiry" }) },
            token
          );
          if (!mounted) return;
          setThreads(created && created.id ? [created] : []);
          setActiveThreadId(created?.id || "");
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
          title: "Ecological Inquiry",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          messages: []
        };
        setThreads([defaultThread]);
        setActiveThreadId(defaultThread.id);
        setMessages([]);
        setError("Could not load your chat history. Your conversation will not be saved until the server is reachable.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    boot();
    return () => {
      mounted = false;
    };
  }, [token]);
  const ensureThreadOnServer = async (thread) => {
    if (thread && thread.id && !thread.id.startsWith("local-")) return thread;
    const created = await apiFetch(
      "/api/pulse/threads",
      { method: "POST", body: JSON.stringify({ title: thread?.title || "Ecological Inquiry" }) },
      token
    );
    if (created && created.id) {
      setThreads((prev) => prev.map((th) => th.id === thread.id ? { ...created, messages: thread.messages || [] } : th));
      setActiveThreadId((prev) => prev === thread.id ? created.id : prev);
      return { ...created, messages: thread.messages || [] };
    }
    return thread;
  };
  const saveActiveThreadMessages = async (updatedMsgs, targetId = activeThreadId) => {
    const persistable = updatedMsgs.map(({ image, imageBase64, ...rest }) => rest);
    const currId = targetId || activeThreadId;
    if (!currId) return;
    const firstUserMsg = persistable.find((m) => m.role === "user")?.content?.trim();
    const autoTitle = firstUserMsg ? firstUserMsg.length > 30 ? firstUserMsg.slice(0, 30) + "\u2026" : firstUserMsg : "Nature Conversation";
    setThreads((prevThreads) => {
      const exists = prevThreads.some((th) => th.id === currId);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      let nextThreads;
      if (!exists) {
        const newTh = { id: currId, title: autoTitle, created_at: now, updated_at: now, messages: persistable };
        nextThreads = [newTh, ...prevThreads];
      } else {
        nextThreads = prevThreads.map((th) => {
          if (th.id === currId) {
            const hasCustomTitle = th.title && th.title !== "Ecological Inquiry" && th.title !== "New Conversation" && th.title !== "Nature Conversation";
            return {
              ...th,
              title: hasCustomTitle ? th.title : autoTitle,
              updated_at: now,
              messages: persistable
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
        { method: "PUT", body: JSON.stringify({ messages: persistable }) },
        token
      );
      if (saved && saved.id) {
        setThreads((prev) => prev.map((th) => th.id === serverThread.id ? { ...saved, messages: persistable } : th));
      }
    } catch (err) {
      setError("Your conversation could not be saved to the server. Please check your connection.");
    }
  };
  const selectLanguage = (code) => {
    setLang(code);
    localStorage.setItem("pulse_chat_lang", code);
    localStorage.setItem("pulse_lang_selected", "1");
    setShowLangModal(false);
    setShowLangDropdown(false);
  };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WebP, and GIF images are supported.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    if (file.size === 0) {
      setError("That file appears to be empty. Please select a valid image.");
      e.target.value = "";
      return;
    }
    try {
      const payload = await fileToResizedBase64(file, 1200);
      setAttachedPayload(payload);
      setAttachedImage(`data:${payload.mime};base64,${payload.base64}`);
      setError("");
    } catch {
      setError("That file could not be read as an image. Please try another one.");
    }
    e.target.value = "";
  };
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is supported in Google Chrome and Microsoft Edge browsers.");
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
      if (lang === "gu") {
        recognition.lang = "gu-IN";
      } else if (lang === "hi") {
        recognition.lang = "hi-IN";
      } else {
        recognition.lang = "en-US";
      }
      recognition.onstart = () => {
        setIsListening(true);
      };
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };
  const startNewChat = async () => {
    setError("");
    let freshThread = {
      id: localThreadId(),
      title: "New Conversation",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      messages: []
    };
    if (token) {
      try {
        const created = await apiFetch(
          "/api/pulse/threads",
          { method: "POST", body: JSON.stringify({ title: "New Conversation" }) },
          token
        );
        if (created && created.id) freshThread = created;
      } catch {
        setError("Could not start a new chat on the server. It will not be saved until the server is reachable.");
      }
    } else {
      setError("Sign in to save your conversations. Chat works, but nothing will be stored.");
    }
    setThreads((prev) => {
      const filtered = prev.filter((th) => th.id !== freshThread.id && th.messages && th.messages.length > 0);
      return [freshThread, ...filtered];
    });
    setActiveThreadId(freshThread.id);
    setMessages([]);
    setText("");
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };
  const loadThread = (threadId) => {
    const th = threads.find((t2) => t2.id === threadId);
    if (!th) return;
    setActiveThreadId(th.id);
    setMessages(th.messages || []);
    setError("");
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };
  const deleteThread = (e, threadId) => {
    e.stopPropagation();
    const nextThreads = threads.filter((t2) => t2.id !== threadId);
    setThreads(nextThreads);
    if (token && threadId && !threadId.startsWith("local-")) {
      apiFetch(`/api/pulse/threads/${threadId}`, { method: "DELETE" }, token).catch(() => {
        setError("The conversation could not be deleted on the server. Please check your connection.");
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
    if (!window.confirm("Are you sure you want to clear all conversation history?")) return;
    setError("");
    let freshThread = {
      id: localThreadId(),
      title: "New Conversation",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      messages: []
    };
    if (token) {
      try {
        await apiFetch("/api/pulse/threads", { method: "DELETE" }, token);
        const created = await apiFetch(
          "/api/pulse/threads",
          { method: "POST", body: JSON.stringify({ title: "New Conversation" }) },
          token
        );
        if (created && created.id) freshThread = created;
      } catch {
        setError("Could not clear your history on the server. Please check your connection.");
      }
    }
    setThreads([freshThread]);
    setActiveThreadId(freshThread.id);
    setMessages([]);
    setText("");
    setAttachedImage(null);
    setAttachedPayload(null);
    setShowHistoryDrawer(false);
  };
  const clear = () => {
    setMessages([]);
    setText("");
    setAttachedImage(null);
    setAttachedPayload(null);
    setError("");
    if (activeThreadId) {
      saveActiveThreadMessages([], activeThreadId);
    }
  };
  const handleRenameThread = (e, threadId) => {
    e.stopPropagation();
    if (!editTitleText.trim()) return;
    const title = editTitleText.trim();
    setThreads((prev) => prev.map((th) => th.id === threadId ? { ...th, title } : th));
    setEditingThreadId(null);
    setEditTitleText("");
    if (token && threadId && !threadId.startsWith("local-")) {
      apiFetch(`/api/pulse/threads/${threadId}`, { method: "PATCH", body: JSON.stringify({ title }) }, token).catch(() => {
        setError("The conversation could not be renamed on the server. Please check your connection.");
      });
    }
  };
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, busy]);
  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    const content = text.trim();
    if (!content && !attachedImage) return;
    let fullMessageContent = content;
    if (attachedImage && !content) {
      fullMessageContent = "[Attached Image Observation]";
    }
    setText("");
    setAttachedImage(null);
    setAttachedPayload(null);
    setBusy(true);
    setError("");
    const userMsg = {
      id: Date.now(),
      user_id: "",
      role: "user",
      content: fullMessageContent,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (attachedImage) userMsg.image = attachedImage;
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    saveActiveThreadMessages(newMsgs);
    try {
      let replyData;
      if (attachedPayload) {
        replyData = await apiFetch(
          "/api/pulse",
          {
            method: "POST",
            body: JSON.stringify({
              message: content,
              imageBase64: attachedPayload.base64,
              contentType: attachedPayload.mime,
              lang,
              thread_id: activeThreadId
            })
          },
          token
        );
      } else {
        replyData = await apiFetch(
          "/api/pulse",
          {
            method: "POST",
            body: JSON.stringify({
              message: content,
              lang,
              thread_id: activeThreadId
            })
          },
          token
        );
      }
      const botReply = {
        id: Date.now() + 1,
        role: "assistant",
        content: replyData?.reply || replyData?.message || "I observed your request. How else can I help you explore?",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const finalMsgs = [...newMsgs, botReply];
      setMessages(finalMsgs);
      saveActiveThreadMessages(finalMsgs);
    } catch {
      setError("");
      const fallbackReply = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I observed your note: "${fullMessageContent}". Nature ecosystems respond dynamically to shade canopy, seasonal humidity, and bird nesting corridors.`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: `h-[calc(100vh-2rem)] md:h-screen w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 flex flex-col overflow-hidden font-sans selection:bg-[#4ADE80]/30 selection:text-white relative gpu-layer transition-colors duration-300 ${isDark ? "text-slate-100" : "text-slate-900"}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      ref: fileInputRef,
      onChange: handleFileChange,
      accept: "image/*",
      className: "hidden"
    }
  ), /* @__PURE__ */ React.createElement("style", null, `
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
      `), /* @__PURE__ */ React.createElement(AnimatePresence, null, isListening && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { scale: 0.88, y: 20 },
        animate: { scale: 1, y: 0 },
        exit: { scale: 0.88, y: 20 },
        className: `border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 relative overflow-hidden transition-colors ${isDark ? "bg-[#112318] border-[#4ADE80]/40 text-white" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4ADE80]/20 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" }),
      /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative mx-auto w-24 h-24 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
        motion.span,
        {
          animate: { scale: [1, 1.35, 1], opacity: [0.3, 0.8, 0.3] },
          transition: { duration: 1.2, repeat: Infinity },
          className: "absolute inset-0 rounded-full bg-[#4ADE80]/30 blur-md"
        }
      ), /* @__PURE__ */ React.createElement("div", { className: `w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-lg relative z-10 ${isDark ? "bg-gradient-to-br from-[#2E6141] to-[#0A180F] border-[#4ADE80]" : "bg-[#E1EFE0] border-[#183B28]"}` }, /* @__PURE__ */ React.createElement(Mic, { className: `w-9 h-9 animate-bounce ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }))), /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold tracking-tight pt-2 ${isDark ? "text-white" : "text-slate-900"}` }, t.listeningTitle), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${isDark ? "text-slate-400" : "text-slate-500"}` }, t.listeningHint), /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isDark ? "bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30" : "bg-emerald-100 text-emerald-900 border-emerald-300"}` }, "\u{1F310} ", t.langName, " Mode (", lang === "gu" ? "gu-IN" : lang === "hi" ? "hi-IN" : "en-US", ")")),
      /* @__PURE__ */ React.createElement("div", { className: `border rounded-2xl p-4 min-h-[90px] flex items-center justify-center text-center ${isDark ? "bg-[#0E2015] border-[#20422E]" : "bg-[#F2ECE1] border-[#E0D8C8]"}` }, /* @__PURE__ */ React.createElement("p", { className: `text-sm sm:text-base font-normal leading-relaxed italic ${isDark ? "text-slate-200" : "text-slate-700"}` }, text ? `"${text}"` : t.listening)),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5 h-8" }, [0.1, 0.3, 0.15, 0.45, 0.2, 0.5, 0.25, 0.4].map((delay, i) => /* @__PURE__ */ React.createElement(
        motion.span,
        {
          key: i,
          animate: { height: ["8px", "32px", "12px", "28px", "8px"] },
          transition: { duration: 0.9, repeat: Infinity, delay },
          className: "w-1.5 rounded-full bg-gradient-to-t from-moss via-sage to-[#4ADE80]"
        }
      ))),
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-center pt-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: toggleListening,
          className: `px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center gap-2 ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`
        },
        /* @__PURE__ */ React.createElement(MicOff, { className: "w-4 h-4" }),
        /* @__PURE__ */ React.createElement("span", null, t.doneListening)
      ))
    )
  )), /* @__PURE__ */ React.createElement(AnimatePresence, null, showLangModal && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
    },
    /* @__PURE__ */ React.createElement("div", { className: `border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden transition-colors ${isDark ? "bg-[#112318] border-[#20452F] text-white" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]"}` }, /* @__PURE__ */ React.createElement("div", { className: "text-center space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: `mx-auto w-12 h-12 rounded-full border flex items-center justify-center text-xl ${isDark ? "bg-[#1A3827] border-[#2D5A3F]" : "bg-[#E1EFE0] border-[#C3DEC0]"}` }, "\u{1F310}"), /* @__PURE__ */ React.createElement("h2", { className: `font-display text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}` }, t.modalTitle), /* @__PURE__ */ React.createElement("p", { className: `text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-500"}` }, t.modalSubtitle)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-2.5" }, LANGUAGES.map((l) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: l.code,
        onClick: () => selectLanguage(l.code),
        className: `flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all cursor-pointer ${lang === l.code ? isDark ? "bg-[#1A3827] border-[#4ADE80] text-white shadow-md" : "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs" : isDark ? "bg-[#13271C]/70 border-[#20422E] text-slate-300 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, l.flag), /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("p", { className: "font-medium text-sm leading-snug" }, l.native), /* @__PURE__ */ React.createElement("p", { className: `text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}` }, l.name))),
      lang === l.code && /* @__PURE__ */ React.createElement("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? "bg-[#4ADE80] text-[#07130B]" : "bg-[#183B28] text-white"}` }, "\u2713")
    ))))
  )), /* @__PURE__ */ React.createElement(AnimatePresence, null, showHistoryDrawer && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end",
      onClick: () => setShowHistoryDrawer(false)
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", stiffness: 400, damping: 35 },
        className: `w-full max-w-sm h-full border-l p-5 shadow-2xl flex flex-col justify-between transition-colors ${isDark ? "bg-[#0E1F14] border-[#20452F] text-white" : "bg-[#FAF7F0] border-[#E3DDD1] text-[#0F2418]"}`,
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { className: "space-y-4 flex-1 flex flex-col min-h-0" }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-between border-b pb-3 ${isDark ? "border-[#20452F]" : "border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-2 font-semibold text-base ${isDark ? "text-white" : "text-slate-900"}` }, /* @__PURE__ */ React.createElement(History, { className: `w-5 h-5 ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }), /* @__PURE__ */ React.createElement("span", null, t.historyTitle)), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setShowHistoryDrawer(false),
          className: `p-1 rounded-full ${isDark ? "text-slate-400 hover:text-white hover:bg-[#1A3827]" : "text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#EDE6D8]"}`
        },
        /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" })
      )), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: startNewChat,
          className: `w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-medium text-sm transition-all cursor-pointer shadow-md ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#1C3727] text-white hover:bg-[#2A4E38]"}`
        },
        /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
        /* @__PURE__ */ React.createElement("span", null, t.newChat)
      ), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroll" }, !threads.length ? /* @__PURE__ */ React.createElement("p", { className: `text-xs py-8 text-center ${isDark ? "text-slate-500" : "text-slate-400"}` }, t.noHistory) : threads.map((th) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: th.id,
          onClick: () => loadThread(th.id),
          className: `group relative p-3 rounded-2xl border transition-all cursor-pointer ${activeThreadId === th.id ? isDark ? "bg-[#1A3827] border-[#4ADE80] text-white shadow-md" : "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs" : isDark ? "bg-[#13271C]/60 border-[#20422E] text-slate-300 hover:bg-[#173022]" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 min-w-0 flex-1" }, /* @__PURE__ */ React.createElement(MessageSquare, { className: `w-4 h-4 shrink-0 ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }), editingThreadId === th.id ? /* @__PURE__ */ React.createElement(
          "input",
          {
            autoFocus: true,
            value: editTitleText,
            onChange: (e) => setEditTitleText(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handleRenameThread(e, th.id);
            },
            onBlur: (e) => handleRenameThread(e, th.id),
            onClick: (e) => e.stopPropagation(),
            className: `border px-2 py-0.5 rounded text-xs outline-none w-full ${isDark ? "bg-[#0E2015] border-[#4ADE80] text-white" : "bg-[#FDFBF7] border-[#183B28] text-[#0F2418]"}`
          }
        ) : /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold truncate leading-snug" }, th.title)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setEditingThreadId(th.id);
              setEditTitleText(th.title);
            },
            className: `p-1 rounded ${isDark ? "text-slate-400 hover:text-white hover:bg-[#254B35]" : "text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#EDE6D8]"}`,
            title: "Rename"
          },
          /* @__PURE__ */ React.createElement(Edit2, { className: "w-3 h-3" })
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => deleteThread(e, th.id),
            className: `p-1 rounded hover:text-red-500 ${isDark ? "text-slate-400 hover:bg-[#254B35]" : "text-[#3E5C48] hover:bg-[#EDE6D8]"}`,
            title: "Delete"
          },
          /* @__PURE__ */ React.createElement(Trash2, { className: "w-3 h-3" })
        ))),
        /* @__PURE__ */ React.createElement("p", { className: `text-[10px] mt-1 truncate ${isDark ? "text-slate-400" : "text-slate-500"}` }, th.messages?.length ? th.messages[th.messages.length - 1].content : "No messages yet")
      ))), threads.some((th) => th.messages && th.messages.length > 0) && /* @__PURE__ */ React.createElement("div", { className: `pt-3 border-t flex items-center justify-between ${isDark ? "border-[#20452F]" : "border-slate-200"}` }, /* @__PURE__ */ React.createElement("span", { className: `text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}` }, threads.filter((th) => th.messages && th.messages.length > 0).length, " conversations"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: clearAllHistory,
          className: "text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer font-medium"
        },
        /* @__PURE__ */ React.createElement(Trash2, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ React.createElement("span", null, "Clear All")
      )))
    )
  )), /* @__PURE__ */ React.createElement("div", { className: `shrink-0 relative rounded-3xl p-7 sm:p-9 min-h-[175px] shadow-2xl overflow-hidden backdrop-blur-xl border transition-colors ${isDark ? "bg-[#112318]/90 border-[#20452F] text-white" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-md"}` }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-5 right-5 flex items-center gap-2.5 z-20" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: startNewChat,
      className: `px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 ${isDark ? "bg-[#4ADE80] hover:bg-[#3ECE77] text-[#07130B]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`,
      title: "Start New Chat"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4 stroke-[2.5]" }),
    /* @__PURE__ */ React.createElement("span", null, t.newChat || "New Chat")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowHistoryDrawer(true),
      className: `px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${isDark ? "bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-100" : "bg-[#F2ECE1] hover:bg-[#EDE6D8] border-[#E0D8C8] text-[#183B28]"}`,
      title: "Chat History"
    },
    /* @__PURE__ */ React.createElement(History, { className: `w-4 h-4 ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, t.historyTitle),
    threads.filter((th) => th.messages?.length > 0).length > 0 && /* @__PURE__ */ React.createElement("span", { className: `ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isDark ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-[#E1EFE0] text-[#183B28]"}` }, threads.filter((th) => th.messages?.length > 0).length)
  ), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowLangDropdown((v) => !v),
      className: `px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${isDark ? "bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-100" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"}`,
      title: "Change Language"
    },
    /* @__PURE__ */ React.createElement(Globe, { className: `w-4 h-4 ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }),
    /* @__PURE__ */ React.createElement("span", null, t.langName),
    /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-3.5 h-3.5 text-slate-400" })
  ), /* @__PURE__ */ React.createElement(AnimatePresence, null, showLangDropdown && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 6 },
      className: `absolute right-0 mt-2 w-40 rounded-2xl p-1.5 shadow-2xl z-30 space-y-1 border ${isDark ? "bg-[#13271C] border-[#20422E]" : "bg-[#FDFBF7] border-[#E3DDD1]"}`
    },
    LANGUAGES.map((l) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: l.code,
        onClick: () => selectLanguage(l.code),
        className: `w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${lang === l.code ? isDark ? "bg-[#1A3827] text-[#4ADE80]" : "bg-[#E1EFE0] text-[#183B28] font-bold" : isDark ? "text-slate-300 hover:bg-[#1A3827]/60 hover:text-white" : "text-[#3E5C48] hover:bg-[#F2ECE1]"}`
      },
      /* @__PURE__ */ React.createElement("span", null, l.flag),
      /* @__PURE__ */ React.createElement("span", null, l.native)
    ))
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggleTheme,
      title: "Toggle Theme",
      className: `w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isDark ? "bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-300 hover:text-white" : "bg-[#F2ECE1] hover:bg-[#EDE6D8] border-[#E0D8C8] text-[#183B28]"}`
    },
    /* @__PURE__ */ React.createElement(Sun, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      title: "Notifications",
      className: `w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer relative ${isDark ? "bg-[#1A3626] hover:bg-[#254B35] border-[#2D5A3F] text-slate-300 hover:text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"}`
    },
    /* @__PURE__ */ React.createElement(Bell, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: `w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "bg-[#1A3626] border-[#2D5A3F] text-slate-200" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#183B28]"}` }, /* @__PURE__ */ React.createElement(User, { className: "w-4 h-4" })), /* @__PURE__ */ React.createElement("span", { className: `absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${isDark ? "bg-[#4ADE80] border-[#112318]" : "bg-emerald-600 border-white"}` })), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: clear,
      className: `ml-1 text-xs flex items-center gap-1 transition-colors cursor-pointer ${isDark ? "text-emerald-400/80 hover:text-emerald-400" : "text-[#183B28] hover:text-[#0F2418] font-semibold"}`,
      title: "Clear Thread"
    },
    /* @__PURE__ */ React.createElement(RotateCcw, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement(LeafBranchHeader, null), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 pr-0 md:pr-40" }, /* @__PURE__ */ React.createElement(EkgPulseOrb, { size: 84, active: busy }), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("p", { className: `text-xs sm:text-sm font-medium tracking-wide ${isDark ? "text-slate-300" : "text-slate-500"}` }, t.welcome), /* @__PURE__ */ React.createElement("h1", { className: `font-display text-4xl sm:text-5xl font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}` }, t.title, " ", /* @__PURE__ */ React.createElement("span", { className: "text-2xl sm:text-3xl" }, "\u{1F343}")), /* @__PURE__ */ React.createElement("div", { className: `text-sm sm:text-base leading-relaxed font-normal pt-0.5 ${isDark ? "text-slate-200/90" : "text-slate-600"}` }, /* @__PURE__ */ React.createElement("p", null, t.tagline1), /* @__PURE__ */ React.createElement("p", null, t.tagline2)), /* @__PURE__ */ React.createElement("div", { className: `flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-600"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F343}"), /* @__PURE__ */ React.createElement("span", null, t.badge1)), /* @__PURE__ */ React.createElement("span", { className: isDark ? "text-slate-600" : "text-slate-300" }, "|"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", null, t.badge2)))))), /* @__PURE__ */ React.createElement("div", { className: "shrink-0 flex justify-center my-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-4 py-1 rounded-full text-xs tracking-wider border ${isDark ? "bg-[#122519] border-[#20452F] text-slate-400" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#3E5C48] shadow-xs"}` }, todayDateString)), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-1.5 custom-chat-scroll" }, busy && /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-center py-10 gap-3 text-sm ${isDark ? "text-emerald-400/80" : "text-emerald-700"}` }, /* @__PURE__ */ React.createElement(EkgPulseOrb, { size: 34, active: true }), /* @__PURE__ */ React.createElement("span", { className: "animate-pulse" }, t.notebookLoading)), !busy && !messages.length && /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3.5 justify-start max-w-full" }, /* @__PURE__ */ React.createElement(EkgPulseOrb, { size: 40 }), /* @__PURE__ */ React.createElement("div", { className: `max-w-lg border-l-4 rounded-2xl rounded-tl-xs p-4.5 shadow-md space-y-2 relative border ${isDark ? "bg-[#13271C] border-[#20422E] border-l-[#4ADE80] text-slate-100" : "bg-[#FDFBF7] border-[#E3DDD1] border-l-[#183B28] text-[#0F2418]"}` }, /* @__PURE__ */ React.createElement("p", { className: "text-base font-medium leading-relaxed pr-4" }, t.welcomeBotMsg1), /* @__PURE__ */ React.createElement("p", { className: `text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-200" : "text-slate-600"}` }, t.welcomeBotMsg2), /* @__PURE__ */ React.createElement("p", { className: `text-xs text-right pt-1 ${isDark ? "text-slate-400" : "text-slate-400"}` }, formatTime()))), /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "popLayout", initial: false }, messages.map((m) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: m.id,
      className: `flex items-end gap-3 group max-w-full ${m.role === "user" ? "justify-end" : "justify-start"}`
    },
    m.role !== "user" && /* @__PURE__ */ React.createElement("div", { className: "shrink-0 mb-0.5" }, /* @__PURE__ */ React.createElement(EkgPulseOrb, { size: 36 })),
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end max-w-[85%] sm:max-w-[78%]" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `relative w-full px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-md ${m.role === "user" ? isDark ? "bg-[#1A3827] border border-[#2D5A3F] text-white rounded-2xl rounded-tr-xs" : "bg-[#183B28] border border-[#183B28] text-[#FAF7F0] rounded-2xl rounded-tr-xs" : isDark ? "bg-[#13271C] border border-[#20422E] border-l-4 border-l-[#4ADE80] text-slate-100 rounded-2xl rounded-tl-xs" : "bg-[#FDFBF7] border border-[#E3DDD1] border-l-4 border-l-[#183B28] text-[#0F2418] rounded-2xl rounded-tl-xs"}`
      },
      m.image && /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1 text-[10px] uppercase tracking-wide mb-1.5 font-semibold ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }, /* @__PURE__ */ React.createElement(ImageIcon, { className: "w-3 h-3" }), "Image attached"), /* @__PURE__ */ React.createElement(
        "img",
        {
          src: m.image,
          alt: "Attached observation",
          className: "rounded-xl max-h-48 w-auto object-cover border border-[#4ADE80]/40"
        }
      )),
      /* @__PURE__ */ React.createElement("div", { className: m.role !== "user" ? "pr-6" : "" }, m.content),
      m.role !== "user" && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => copyMessage(m.id, m.content),
          className: `absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${isDark ? "text-slate-400 hover:text-white hover:bg-[#1A3827]" : "text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#F2ECE1]"}`,
          title: "Copy message"
        },
        copiedId === m.id ? /* @__PURE__ */ React.createElement(Check, { className: `w-4 h-4 ${isDark ? "text-[#4ADE80]" : "text-emerald-600"}` }) : /* @__PURE__ */ React.createElement(Copy, { className: "w-4 h-4" })
      )
    ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-xs text-slate-400 mt-1 px-1" }, /* @__PURE__ */ React.createElement("span", null, formatTime(m.created_at)), m.role === "user" && /* @__PURE__ */ React.createElement(CheckCheck, { className: `w-4 h-4 ${isDark ? "text-[#4ADE80]" : "text-emerald-600"}` })))
  ))), busy && /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-2 text-xs sm:text-sm pl-1 font-medium ${isDark ? "text-[#4ADE80]" : "text-emerald-700"}` }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 100", className: "w-4 h-4" }, /* @__PURE__ */ React.createElement("path", { d: "M 10 50 L 35 50 L 45 25 L 55 75 L 65 40 L 75 55 L 90 50", fill: "none", stroke: "currentColor", strokeWidth: "6", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("span", null, t.thinking), /* @__PURE__ */ React.createElement("span", { className: `w-2 h-2 rounded-full animate-ping ${isDark ? "bg-[#4ADE80]" : "bg-emerald-600"}` })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 justify-start" }, /* @__PURE__ */ React.createElement(EkgPulseOrb, { size: 36, active: true }), /* @__PURE__ */ React.createElement(BouncingDots, null))), /* @__PURE__ */ React.createElement("div", { ref: endRef })), error && /* @__PURE__ */ React.createElement("div", { className: "shrink-0 my-1" }, /* @__PURE__ */ React.createElement(ErrorBanner, { message: error })), /* @__PURE__ */ React.createElement("form", { onSubmit: send, className: "shrink-0 pt-2 pb-1 space-y-1.5" }, attachedImage && /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-2 px-3 py-1.5 rounded-2xl w-fit border ${isDark ? "bg-[#12241A] border-[#234A33]" : "bg-[#F2ECE1] border-[#E0D8C8] shadow-xs"}` }, /* @__PURE__ */ React.createElement("img", { src: attachedImage, alt: "Attachment", className: "w-8 h-8 rounded object-cover border border-[#4ADE80]/40" }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: `text-xs truncate max-w-[160px] ${isDark ? "text-slate-200" : "text-slate-800"}` }, attachedPayload?.name || "Image attached"), /* @__PURE__ */ React.createElement("span", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}` }, "Ready to send")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setAttachedImage(null);
        setAttachedPayload(null);
        setError("");
      },
      className: "p-1 text-slate-400 hover:text-red-500 cursor-pointer",
      title: "Remove image",
      "aria-label": "Remove attached image"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-3.5 h-3.5" })
  )), /* @__PURE__ */ React.createElement("div", { className: `relative rounded-full p-2 pl-5 sm:pl-6 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all border ${isDark ? "bg-[#12241A]/95 border-[#234A33] focus-within:border-[#4ADE80]/70 focus-within:ring-2 focus-within:ring-[#4ADE80]/20" : "bg-[#FDFBF7] border-[#E0D8C8] focus-within:border-[#183B28] focus-within:ring-2 focus-within:ring-[#183B28]/20 shadow-lg"}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: text,
      onChange: (e) => setText(e.target.value),
      placeholder: t.inputPlaceholder,
      className: `flex-1 bg-transparent text-sm sm:text-base outline-none font-normal ${isDark ? "text-white placeholder:text-slate-500" : "text-[#0F2418] placeholder:text-[#4F6856]"}`
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 shrink-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleImageClick,
      className: `p-2 rounded-full transition-colors cursor-pointer ${isDark ? "text-slate-400 hover:text-white hover:bg-[#1C3A29]" : "text-[#3E5C48] hover:text-[#0F2418] hover:bg-[#F2ECE1]"}`,
      title: "Attach Image / Observation",
      "aria-label": "Attach an image"
    },
    /* @__PURE__ */ React.createElement(ImageIcon, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: toggleListening,
      className: `p-2.5 rounded-full transition-colors cursor-pointer ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : isDark ? "text-slate-400 hover:text-white hover:bg-[#1C3A29]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`,
      title: isListening ? "Stop Listening" : "Voice Input (Speech-to-Text)"
    },
    isListening ? /* @__PURE__ */ React.createElement(MicOff, { className: "w-4 h-4 text-red-500" }) : /* @__PURE__ */ React.createElement(Mic, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: busy || !text.trim() && !attachedImage,
      className: `w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 shadow-md cursor-pointer ${isDark ? "bg-[#4ADE80] hover:bg-[#3ECE77] text-[#07130B] shadow-[#4ADE80]/20" : "bg-[#183B28] hover:bg-[#255239] text-[#FAF7F0]"}`,
      "aria-label": "Send"
    },
    /* @__PURE__ */ React.createElement(Send, { className: "w-4 h-4 ml-0.5" })
  ))), /* @__PURE__ */ React.createElement("p", { className: `text-xs text-center font-normal ${isDark ? "text-slate-500" : "text-slate-400"}` }, t.disclaimer)));
}
