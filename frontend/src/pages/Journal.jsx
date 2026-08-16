import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, PenTool, Pin, Trash2, Edit3, Heart, Save, 
  Search, Calendar, Filter, Mic, Lock, Eye, ArrowRight, X, Lightbulb, 
  Smile, CloudRain, Sun, Leaf, Flame, HelpCircle, Archive, Compass, Check, 
  Quote, Moon, Trees, MessageSquare, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Living Botanical Parchment Journal
const JOURNAL_TRANSLATIONS = {
  en: {
    heroTag: 'YOUR PRIVATE SPACE',
    heroTitle: 'Private Nature Thinking',
    heroHighlight: 'Canvas 🍃',
    heroSubtitle: 'A quiet, distraction-free space for your personal thoughts, field reflections, and eco-discoveries.',
    zenModeBtn: '✨ Zen Writing Mode',
    zenSubtitle: 'Focus. Write. Reflect.',
    tabJournalTitle: 'Journal Canvas',
    tabJournalSub: 'Write freely',
    tabIdeaTitle: 'Idea Vault',
    tabIdeaSub: 'Capture ideas',
    tabMemoryTitle: 'Memory Capsules',
    tabMemorySub: 'Save moments',
    tabAskTitle: 'Ask My Journal',
    tabAskSub: 'Get insights',
    newReflectionTitle: 'Capture a New Field Reflection',
    newReflectionSub: 'Let your thoughts flow like a stream.',
    titlePlaceholder: 'e.g., Peepal Leaf Droplets After Dawn Rain…',
    bodyPlaceholder: 'What changed. What stayed. What you almost missed in nature today…',
    moodLabel: 'Botanical Atmosphere Mood',
    moodSub: 'Set the vibe of your writing space',
    saveBtn: 'Save to Private Vault',
    saveSub: 'Keep it safe, keep it yours',
    quoteText: 'Nature is not a place to visit, it is home.',
    quoteAuthor: '— Gary Snyder',
  },
  gu: {
    heroTag: 'તમારી ખાનગી જગ્યા',
    heroTitle: 'ખાનગી પ્રકૃતિ વિચાર',
    heroHighlight: 'કેનવાસ 🍃',
    heroSubtitle: 'તમારા વ્યક્તિગત વિચારો અને પ્રકૃતિના અવલોકનો માટે એક શાંત, વિક્ષેપ મુક્ત જગ્યા.',
    zenModeBtn: '✨ ઝેન રાઇટિંગ મોડ',
    zenSubtitle: 'ધ્યાન. લખાણ. મંતવ્ય.',
    tabJournalTitle: 'જર્નલ કેનવાસ',
    tabJournalSub: 'મુક્તપણે લખો',
    tabIdeaTitle: 'આઇડિયા વોલ્ટ',
    tabIdeaSub: 'વિચારો સેવ કરો',
    tabMemoryTitle: 'મેમરી કેપ્સ્યુલ્સ',
    tabMemorySub: 'ક્ષણો સેવ કરો',
    tabAskTitle: 'મારા જર્નલને પૂછો',
    tabAskSub: 'માહિતી મેળવો',
    newReflectionTitle: 'નવું અવલોકન લખો',
    newReflectionSub: 'તમારા વિચારોને વહેવા દો.',
    titlePlaceholder: 'દા.ત., વરસાદ પછી પીપળાના પાંદડા પરનું પાણી…',
    bodyPlaceholder: 'આજે પ્રકૃતિમાં તમે શું જોયું અને અનુભવ્યું…',
    moodLabel: 'મૂડ અને વાતાવરણ',
    moodSub: 'લેખન ક્ષેત્રનું વાતાવરણ પસંદ કરો',
    saveBtn: 'પ્રાઇવેટ વોલ્ટમાં સેવ કરો',
    saveSub: 'સુરક્ષિત રાખો',
    quoteText: 'પ્રકૃતિ માત્ર મુલાકાત લેવાની જગ્યા નથી, તે આપણું ઘર છે.',
    quoteAuthor: '— ગેરી સ્નાઇડર',
  },
  hi: {
    heroTag: 'आपका निजी स्थान',
    heroTitle: 'निजी प्रकृति विचार',
    heroHighlight: 'कैनवास 🍃',
    heroSubtitle: 'आपके व्यक्तिगत विचारों और प्रकृति के अवलोकनों के लिए एक शांत, व्याकुलता-मुक्त स्थान।',
    zenModeBtn: '✨ ज़ेन राइटिंग मोड',
    zenSubtitle: 'ध्यान। लेखन। विचार।',
    tabJournalTitle: 'जर्नल कैनवास',
    tabJournalSub: 'स्वतंत्र रूप से लिखें',
    tabIdeaTitle: 'आइडिया वॉल्ट',
    tabIdeaSub: 'विचार सहेजें',
    tabMemoryTitle: 'मेमोरी कैप्सूल',
    tabMemorySub: 'क्षण सहेजें',
    tabAskTitle: 'मेरे जर्नल से पूछें',
    tabAskSub: 'अंतर्दृष्टि प्राप्त करें',
    newReflectionTitle: 'नया अवलोकन लिखें',
    newReflectionSub: 'अपने विचारों को बहने दें।',
    titlePlaceholder: 'जैसे, बारिश के बाद पीपल के पत्तों पर पानी…',
    bodyPlaceholder: 'आज प्रकृति में आपने क्या देखा और महसूस किया…',
    moodLabel: 'मूड़ और वातावरण',
    moodSub: 'लेखन क्षेत्र का वातावरण चुनें',
    saveBtn: 'प्राइवेट वॉल्ट में सहेजें',
    saveSub: 'सुरक्षित रखें',
    quoteText: 'प्रकृति केवल घूमने की जगह नहीं है, यह हमारा घर है।',
    quoteAuthor: '— गैरी स्नाइडर',
  },
};

// Seed Journal Entries
const SEED_ENTRIES = [
  {
    id: 'j-1',
    title: 'Peepal Leaf Droplets After Dawn Rain',
    body: 'The morning humidity was 88%. Standing under the ancient Peepal tree near the river bank, water droplets formed golden spheres on the leaf veins.',
    mood: 'Quiet Canopy',
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
    mood: 'Sunlit Meadow',
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

  // Persistent State
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
  const [selectedMood, setSelectedMood] = useState('Quiet Canopy');
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('pulse_journal_entries_v1', JSON.stringify(entries));
  }, [entries]);

  // Save Note Submit
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    const newEntry = {
      id: `j-${Date.now()}`,
      title: title.trim() || 'Untitled Reflection',
      body: body.trim(),
      mood: selectedMood,
      weather: '26°C · Field Observation',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pinned: false,
      wordCount: body.trim().split(/\s+/).length,
      aiReflection: `Key Theme: ${title.trim() || 'Nature reflection'}`,
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setBody('');
    setAutoSaveStatus('Saved to Private Vault ✓');
    setTimeout(() => setAutoSaveStatus(''), 2500);
    if (isZenMode) setIsZenMode(false);
  };

  // Delete Note
  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Mood Options Array
  const MOOD_OPTIONS = [
    { id: 'Quiet Canopy', label: 'Quiet Canopy', icon: <Leaf className="w-4 h-4 text-emerald-400" /> },
    { id: 'Rain Whisper', label: 'Rain Whisper', icon: <CloudRain className="w-4 h-4 text-cyan-400" /> },
    { id: 'Sunlit Meadow', label: 'Sunlit Meadow', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'Forest Calm', label: 'Forest Calm', icon: <Trees className="w-4 h-4 text-[#4ADE80]" /> },
    { id: 'Evening Hush', label: 'Evening Hush', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

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
                Exit Zen Mode
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
                {t.saveBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">
        
        {/* ──────────────── ATMOSPHERIC DARK FOREST LANDSCAPE HERO BANNER (NO ROUND CIRCLE ICON) ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[240px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
          
          {/* High-Definition Dark Misty Forest Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80')` }}
          />

          {/* Dark Atmospheric Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/85 to-[#040C07]/35" />

          {/* Left Overlaid Text Content */}
          <div className="space-y-3 max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4ADE80] bg-[#0E2015]/90 px-3.5 py-1 rounded-full border border-[#4ADE80]/40 backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5" />
              {t.heroTag}
            </span>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {t.heroTitle} <span className="text-[#4ADE80]">{t.heroHighlight}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Right Side Control Button */}
          <div className="relative z-10 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsZenMode(true)}
              className="px-5 py-3 rounded-2xl bg-[#0E2517]/90 border border-[#4ADE80]/40 text-left hover:border-[#4ADE80] transition-all shadow-xl cursor-pointer backdrop-blur-md"
            >
              <div className="flex items-center gap-2 text-[#4ADE80] font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{t.zenModeBtn}</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">{t.zenSubtitle}</p>
            </motion.button>
          </div>

        </div>

        {/* ──────────────── 4 GLASS TAB CARDS ──────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('journal')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 shadow-lg ${
              activeTab === 'journal'
                ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                : 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg shrink-0">
              📖
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-white">{t.tabJournalTitle}</h4>
              <p className="text-[11px] text-slate-400">{t.tabJournalSub}</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('idea')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'idea'
                ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                : 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg shrink-0">
                🌱
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">{t.tabIdeaTitle}</h4>
                <p className="text-[11px] text-slate-400">{t.tabIdeaSub}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#1A3827] text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/30">12</span>
          </div>

          <div
            onClick={() => setActiveTab('memory')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'memory'
                ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                : 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg shrink-0">
                🫙
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">{t.tabMemoryTitle}</h4>
                <p className="text-[11px] text-slate-400">{t.tabMemorySub}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#1A3827] text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/30">8</span>
          </div>

          <div
            onClick={() => setActiveTab('ask')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'ask'
                ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                : 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg shrink-0">
                💬
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">{t.tabAskTitle}</h4>
                <p className="text-[11px] text-slate-400">{t.tabAskSub}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#1A3827] text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/30">3</span>
          </div>
        </div>

        {/* ──────────────── CAPTURE A NEW FIELD REFLECTION FORM ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#20452F] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80]/50 flex items-center justify-center text-[#4ADE80] text-lg">
              🍃
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white">{t.newReflectionTitle}</h3>
              <p className="text-xs text-slate-400">{t.newReflectionSub}</p>
            </div>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="relative flex items-center bg-[#07150C] border border-[#20422E] rounded-2xl overflow-hidden focus-within:border-[#4ADE80] transition-all">
              <div className="px-4 py-3.5 border-r border-[#20422E] bg-[#0E2015] text-[#4ADE80]">
                🍃
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full bg-transparent px-4 py-3.5 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="relative flex items-start bg-[#07150C] border border-[#20422E] rounded-2xl overflow-hidden focus-within:border-[#4ADE80] transition-all">
              <div className="px-4 py-4 border-r border-[#20422E] bg-[#0E2015] text-[#4ADE80] self-stretch flex items-start">
                “
              </div>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.bodyPlaceholder}
                className="w-full bg-transparent p-4 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500 resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-[#20452F]">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-slate-200">{t.moodLabel}</p>
                  <p className="text-[10px] text-slate-400">{t.moodSub}</p>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {MOOD_OPTIONS.map((m) => {
                    const isSelected = selectedMood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMood(m.id)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#1A3827] border-2 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20 scale-105'
                            : 'bg-[#07150C] border border-[#20422E] group-hover:border-[#4ADE80]/50'
                        }`}>
                          {m.icon}
                        </div>
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#4ADE80]' : 'text-slate-400'}`}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center justify-center gap-3 cursor-pointer shrink-0"
              >
                <div className="w-7 h-7 rounded-full bg-[#07130B]/20 flex items-center justify-center text-xs">
                  🍃
                </div>
                <div className="text-left">
                  <p className="font-extrabold">{t.saveBtn}</p>
                  <p className="text-[10px] opacity-80 font-normal">{t.saveSub}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>

        {/* ──────────────── GARY SNYDER QUOTE STRIP ──────────────── */}
        <div className="bg-gradient-to-r from-[#06140B] via-[#0E2517] to-[#040C07] border border-[#20452F] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#4ADE80]">“</span>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              "{t.quoteText}" <span className="text-[#4ADE80] font-bold ml-2">{t.quoteAuthor}</span>
            </p>
          </div>
          <Trees className="w-5 h-5 text-[#4ADE80]/40 hidden sm:block" />
        </div>

      </div>
    </div>
  );
}
