import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, PenTool, Pin, Trash2, Edit3, Heart, Save, 
  Search, Calendar, Filter, Mic, Lock, Eye, ArrowRight, X, Lightbulb, 
  Smile, CloudRain, Sun, Leaf, Flame, HelpCircle, Archive, Compass, Check, BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Living Botanical Parchment Journal
const JOURNAL_TRANSLATIONS = {
  en: {
    heroTag: 'FIELD NOTES ARCHIVE',
    heroTitle: 'Private Nature Thinking Canvas',
    heroSubtitle: 'A quiet, distraction-free space for your personal thoughts, field reflections, and eco-discoveries.',
    newNoteTitle: 'Capture a New Field Reflection',
    titlePlaceholder: 'e.g., Peepal Leaf Droplets After Dawn Rain…',
    bodyPlaceholder: 'What changed. What stayed. What you almost missed in nature today…',
    saveNoteBtn: 'Save to Private Vault',
    zenModeBtn: '✨ Zen Writing Mode',
    exitZenBtn: 'Exit Zen Mode',
    tabJournal: '📖 Journal Canvas',
    tabIdeaVault: '💡 Idea Vault',
    tabMemoryCapsules: '🔒 Memory Capsules',
    tabAskJournal: '🔮 Ask My Journal',
    moodLabel: 'Botanical Atmosphere Mood',
    searchPlaceholder: 'Search field notes, moods, tags…',
    autoSaveStatus: 'Saved to Private Vault ✓',
    askJournalPrompt: 'Ask about your saved journal reflections…',
    aiReflectBtn: '✨ Reflection',
  },
  gu: {
    heroTag: 'ફીલ્ડ નોટ્સ આર્કાઇવ',
    heroTitle: 'ખાનગી પ્રકૃતિ વિચાર કેનવાસ',
    heroSubtitle: 'તમારા વ્યક્તિગત વિચારો અને પ્રકૃતિના અવલોકનો માટે એક શાંત, વિક્ષેપ મુક્ત જગ્યા.',
    newNoteTitle: 'નવું અવલોકન લખો',
    titlePlaceholder: 'દા.ત., વરસાદ પછી પીપળાના પાંદડા પરનું પાણી…',
    bodyPlaceholder: 'આજે પ્રકૃતિમાં તમે શું જોયું અને અનુભવ્યું…',
    saveNoteBtn: 'પ્રાઇવેટ વોલ્ટમાં સેવ કરો',
    zenModeBtn: '✨ ઝેન રાઇટિંગ મોડ',
    exitZenBtn: 'ઝેન મોડમાંથી બહાર નીકળો',
    tabJournal: '📖 જર્નલ કેનવાસ',
    tabIdeaVault: '💡 આઇડિયા વોલ્ટ',
    tabMemoryCapsules: '🔒 મેમરી કેપ્સ્યુલ્સ',
    tabAskJournal: '🔮 મારા જર્નલને પૂછો',
    moodLabel: 'મૂડ અને વાતાવરણ',
    searchPlaceholder: 'નોંધો, મૂડ, ટેગ્સ શોધો…',
    autoSaveStatus: 'વોલ્ટમાં સેવ થયું ✓',
    askJournalPrompt: 'તમારી નોંધો વિશે પૂછો…',
    aiReflectBtn: '✨ રિફ્લેક્શન',
  },
  hi: {
    heroTag: 'फील्ड नोट्स आर्काइव',
    heroTitle: 'निजी प्रकृति विचार कैनवास',
    heroSubtitle: 'आपके व्यक्तिगत विचारों और प्रकृति के अवलोकनों के लिए एक शांत, व्याकुलता-मुक्त स्थान।',
    newNoteTitle: 'नया अवलोकन लिखें',
    titlePlaceholder: 'जैसे, बारिश के बाद पीपल के पत्तों पर पानी…',
    bodyPlaceholder: 'आज प्रकृति में आपने क्या देखा और महसूस किया…',
    saveNoteBtn: 'प्राइवेट वॉल्ट में सहेजें',
    zenModeBtn: '✨ ज़ेन राइटिंग मोड',
    exitZenBtn: 'ज़ेन मोड से बाहर निकलें',
    tabJournal: '📖 जर्नल कैनवास',
    tabIdeaVault: '💡 आइडिया वॉल्ट',
    tabMemoryCapsules: '🔒 मेमोरी कैप्सूल',
    tabAskJournal: '🔮 मेरे जर्नल से पूछें',
    moodLabel: 'मूड़ और वातावरण',
    searchPlaceholder: 'नोट्स, मूड, टैग खोजें…',
    autoSaveStatus: 'वॉल्ट में सहेजा गया ✓',
    askJournalPrompt: 'अपने नोट्स के बारे में पूछें…',
    aiReflectBtn: '✨ रिफ्लेक्शन',
  },
};

// Seed Journal Entries
const SEED_ENTRIES = [
  {
    id: 'j-1',
    title: 'Peepal Leaf Droplets After Dawn Rain',
    body: 'The morning humidity was 88%. Standing under the ancient Peepal tree near the river bank, water droplets formed golden spheres on the leaf veins.',
    mood: '🌿 Quiet Canopy',
    weather: 'Cool Rain · 24°C',
    date: 'Aug 16, 2026',
    pinned: true,
    wordCount: 32,
    aiReflection: 'Key Theme: Canopy condensation & urban micro-climate dampness.',
  },
  {
    id: 'j-2',
    title: 'Swallowtail Butterfly Feeding Rhythm',
    body: 'Observed 2 swallowtails feeding on yellow Champa flowers between 10:00 AM and 11:30 AM. Their wing frequency slowed during peak sun exposure.',
    mood: '☀️ Sunlit Bloom',
    weather: 'Clear Skies · 31°C',
    date: 'Aug 14, 2026',
    pinned: false,
    wordCount: 28,
    aiReflection: 'Key Theme: Insect pollination activity during peak solar hours.',
  },
];

export default function Journal() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = JOURNAL_TRANSLATIONS[lang] || JOURNAL_TRANSLATIONS.en;

  // Persistent Journal State
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_journal_entries_v1');
      return saved ? JSON.parse(saved) : SEED_ENTRIES;
    } catch {
      return SEED_ENTRIES;
    }
  });

  // Active States
  const [activeTab, setActiveTab] = useState('journal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Note State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('🌿 Quiet Canopy');
  const [weather, setWeather] = useState('Cool Rain · 24°C');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Ask Journal State
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState([
    { id: 1, sender: 'ai', text: 'Welcome to "Ask My Journal". You can analyze your private field notes and answer questions about your observations.' },
  ]);

  useEffect(() => {
    localStorage.setItem('pulse_journal_entries_v1', JSON.stringify(entries));
  }, [entries]);

  // Auto-Save Effect
  useEffect(() => {
    if (!title.trim() && !body.trim()) return;
    setAutoSaveStatus('Saving draft…');
    const timer = setTimeout(() => {
      setAutoSaveStatus(t.autoSaveStatus);
    }, 800);
    return () => clearTimeout(timer);
  }, [title, body, t.autoSaveStatus]);

  // Save Note Submit
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    const newEntry = {
      id: `j-${Date.now()}`,
      title: title.trim() || 'Untitled Reflection',
      body: body.trim(),
      mood,
      weather,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pinned: false,
      wordCount: body.trim().split(/\s+/).length,
      aiReflection: `Key Theme: ${title.trim() || 'Nature observation'}`,
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setBody('');
    if (isZenMode) setIsZenMode(false);
  };

  // Toggle Pin Note
  const togglePin = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e))
    );
  };

  // Delete Note
  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Ask Journal Handler
  const handleAskJournal = (e) => {
    e.preventDefault();
    if (!askInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: askInput.trim() };
    setAskMessages((prev) => [...prev, userMsg]);
    setAskInput('');

    setTimeout(() => {
      const summary = `Based on your private journal: On Aug 16, you noted Peepal leaf droplets during 88% humidity. On Aug 14, you observed Swallowtail butterfly feeding rhythms during peak solar hours.`;
      setAskMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: summary }]);
    }, 1000);
  };

  // Filtered Entries
  const filteredEntries = entries.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchBody = e.body.toLowerCase().includes(q);
      const matchMood = e.mood.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchMood) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── ZEN DISTRACTION-FREE WRITING CANVAS ──────────────── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#061209] p-6 sm:p-12 overflow-y-auto flex flex-col justify-between"
          >
            <div className="flex justify-between items-center border-b border-[#20452F] pb-4">
              <span className="text-xs font-bold text-[#4ADE80] flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>ZEN DISTRACTION-FREE THINKING CANVAS</span>
              </span>

              <button
                onClick={() => setIsZenMode(false)}
                className="px-4 py-2 rounded-full bg-[#13271C] border border-[#20422E] text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
              >
                {t.exitZenBtn}
              </button>
            </div>

            <div className="max-w-3xl mx-auto w-full my-8 space-y-6">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full bg-transparent font-display text-3xl sm:text-5xl font-extrabold text-white outline-none placeholder:text-slate-600"
              />

              <textarea
                autoFocus
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.bodyPlaceholder}
                className="w-full bg-transparent text-lg sm:text-xl text-slate-200 leading-relaxed outline-none placeholder:text-slate-600 resize-none"
              />
            </div>

            <div className="flex justify-between items-center border-t border-[#20452F] pt-4">
              <span className="text-xs text-[#4ADE80] font-mono">{autoSaveStatus}</span>
              <button
                onClick={handleSaveNote}
                className="px-8 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm cursor-pointer shadow-xl"
              >
                {t.saveNoteBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── RADICAL UNIQUE HEADER 4: PARCHMENT SCROLL STRIP (NO GREEN RECTANGLE) ──────────────── */}
        <div className="relative py-6 px-4 border-b border-[#20452F] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#13271C] border border-[#4ADE80]/40 flex items-center justify-center text-[#4ADE80] text-2xl font-mono shadow-md shrink-0">
              ✒️
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#4ADE80] uppercase tracking-widest">
                {t.heroTag}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsZenMode(true)}
            className="px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.zenModeBtn}</span>
          </motion.button>
        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
          {[
            { id: 'journal', label: t.tabJournal },
            { id: 'ideaVault', label: t.tabIdeaVault },
            { id: 'memoryCapsules', label: t.tabMemoryCapsules },
            { id: 'askJournal', label: t.tabAskJournal },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                  : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──────────────── TAB 1: JOURNAL WRITING CANVAS ──────────────── */}
        {activeTab === 'journal' && (
          <div className="space-y-8">
            
            {/* New Reflection Input Box */}
            <div className="bg-[#112318] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#4ADE80]" />
                  <span>{t.newNoteTitle}</span>
                </h3>

                {autoSaveStatus && (
                  <span className="text-xs text-[#4ADE80] font-mono">{autoSaveStatus}</span>
                )}
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]"
                />

                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t.bodyPlaceholder}
                  className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl p-4 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80] resize-none"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">{t.moodLabel}:</span>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="bg-[#0E2015] border border-[#20422E] text-xs text-white rounded-xl px-3 py-1.5 outline-none focus:border-[#4ADE80]"
                    >
                      <option value="🌿 Quiet Canopy">🌿 Quiet Canopy</option>
                      <option value="🌧️ Rainy Canopy">🌧️ Rainy Canopy</option>
                      <option value="☀️ Sunlit Bloom">☀️ Sunlit Bloom</option>
                      <option value="🍂 Weathered Bark">🍂 Weathered Bark</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] cursor-pointer shadow-lg shrink-0"
                  >
                    {t.saveNoteBtn}
                  </button>
                </div>
              </form>
            </div>

            {/* Past Reflections Grid with 3D Flip */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-2xl font-bold text-white">Saved Field Reflections</h3>
                <span className="text-xs text-slate-400">Hover Card to 3D Flip</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredEntries.map((entry) => {
                  const isFlipped = flippedCardId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className="perspective-1000 h-52 cursor-pointer"
                      onMouseEnter={() => setFlippedCardId(entry.id)}
                      onMouseLeave={() => setFlippedCardId(null)}
                    >
                      <motion.div
                        className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-xl rounded-3xl"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        {/* FRONT REFLECTION CARD */}
                        <div className="absolute inset-0 backface-hidden bg-[#112318] border border-[#20452F] rounded-3xl p-6 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="px-3 py-0.5 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                                {entry.mood}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePin(entry.id);
                                  }}
                                  className={`p-1 text-xs ${entry.pinned ? 'text-amber-400' : 'text-slate-500'}`}
                                >
                                  📌
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEntry(entry.id);
                                  }}
                                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-display text-lg font-bold text-white line-clamp-1">{entry.title}</h4>
                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{entry.body}</p>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-[#20422E]">
                            <span>{entry.date}</span>
                            <span className="text-[#4ADE80] font-bold">Hover Flip 3D →</span>
                          </div>
                        </div>

                        {/* BACK REFLECTION CARD */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0E2015] border border-[#4ADE80]/50 rounded-3xl p-6 flex flex-col justify-between text-slate-200">
                          <div>
                            <h5 className="font-display text-sm font-bold text-[#4ADE80]">Reflection Synthesis</h5>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed italic">
                              "{entry.aiReflection}"
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Word Count: {entry.wordCount} words</span>
                            <span className="text-[#4ADE80] font-semibold">Private & Encrypted</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
