import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, PenTool, Pin, Trash2, Edit3, Heart, Save, 
  Search, Calendar, Filter, Mic, Lock, Eye, ArrowRight, X, Lightbulb, 
  Smile, CloudRain, Sun, Leaf, Flame, HelpCircle, Archive, Compass, Check, 
  Quote, Moon, Trees, MessageSquare, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen, uploadImage, fileToResizedBase64 } from '../lib/api';
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

export default function Journal() {
  const { session } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = JOURNAL_TRANSLATIONS[lang] || JOURNAL_TRANSLATIONS.en;
  const token = session?.access_token;

  // Persistent State
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('np_journal_entries') || '[]');
    } catch {
      return [];
    }
  });

  // Active States
  const [activeTab, setActiveTab] = useState('journal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Quiet Canopy');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState(null);       // raw File object
  const [photoPreview, setPhotoPreview] = useState('');   // local data URI for preview
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const payload = await fileToResizedBase64(file, 1200);
      setPhotoFile(payload);
      setPhotoPreview(`data:${payload.mime};base64,${payload.base64}`);
    } catch {
      setPhotoPreview('');
      setPhotoFile(null);
    }
  };

  const clearPhoto = () => { setPhotoFile(null); setPhotoPreview(''); };

  useEffect(() => {
    const localSaved = JSON.parse(localStorage.getItem('np_journal_entries') || '[]');
    if (token) {
      apiFetch('/api/journal', {}, token)
        .then((list) => {
          if (Array.isArray(list)) {
            const backendItems = list.map((x) => ({
              ...x,
              id: x._id || x.id,
              date: x.createdAt
                ? new Date(x.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              wordCount: (x.body || '').split(/\s+/).length,
            }));
            const merged = [...localSaved, ...backendItems.filter((b) => !localSaved.some((l) => l.id === b.id))];
            setEntries(merged);
            localStorage.setItem('np_journal_entries', JSON.stringify(merged));
          }
        })
        .catch(() => {
          setEntries(localSaved);
        });
    } else {
      setEntries(localSaved);
    }
  }, [token]);

  // Save Note Submit
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setAutoSaveStatus('Saving…');

    // 1. Upload photo to Cloudinary if attached
    let image_url = '';
    if (photoFile) {
      setPhotoUploading(true);
      try {
        const upRes = await uploadImage({ base64: photoFile.base64, mime: photoFile.mime, fileName: 'journal-photo.jpg', token });
        image_url = upRes?.url || photoPreview;
      } catch {
        image_url = photoPreview; // fallback to local data URI
      } finally {
        setPhotoUploading(false);
      }
    }

    const localEntry = {
      id: `j-${Date.now()}`,
      title: title.trim() || 'Untitled Reflection',
      body: body.trim(),
      mood: selectedMood,
      weather: '26°C · Field Observation',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      pinned: false,
      wordCount: body.trim().split(/\s+/).length,
      aiReflection: `Key Theme: ${title.trim() || 'Nature reflection'}`,
      image_url,
    };

    const updatedList = [localEntry, ...entries.filter((x) => x.id !== localEntry.id)];
    setEntries(updatedList);
    localStorage.setItem('np_journal_entries', JSON.stringify(updatedList));

    setTitle('');
    setBody('');
    clearPhoto();
    if (isZenMode) setIsZenMode(false);

    if (token) {
      try {
        const created = await apiFetch(
          '/api/journal',
          { method: 'POST', body: JSON.stringify({ title: localEntry.title, body: localEntry.body, mood: selectedMood, image_url }) },
          token
        );
        const syncedList = [{ ...created, id: created._id || created.id, image_url }, ...updatedList.filter((x) => x.id !== localEntry.id)];
        setEntries(syncedList);
        localStorage.setItem('np_journal_entries', JSON.stringify(syncedList));
        setAutoSaveStatus('Saved to Private Vault ✓');
      } catch {
        setAutoSaveStatus('Saved locally to your device ✓');
      }
    } else {
      setAutoSaveStatus('Saved locally to your device ✓');
    }
    setTimeout(() => setAutoSaveStatus(''), 2500);
  };

  // Delete Note
  const deleteEntry = (id) => {
    const filtered = entries.filter((e) => e.id !== id && e._id !== id);
    setEntries(filtered);
    localStorage.setItem('np_journal_entries', JSON.stringify(filtered));
    if (token && id && !String(id).startsWith('j-')) {
      apiFetch(`/api/journal/${id}`, { method: 'DELETE' }, token).catch(() => {});
    }
  };

  // Mood Options Array
  const MOOD_OPTIONS = [
    { id: 'Quiet Canopy', label: 'Quiet Canopy', icon: <Leaf className="w-4 h-4 text-emerald-400" /> },
    { id: 'Rain Whisper', label: 'Rain Whisper', icon: <CloudRain className="w-4 h-4 text-cyan-400" /> },
    { id: 'Sunlit Meadow', label: 'Sunlit Meadow', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'Forest Calm', label: 'Forest Calm', icon: <Trees className="w-4 h-4 text-[#4ADE80]" /> },
    { id: 'Evening Hush', label: 'Evening Hush', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── ZEN DISTRACTION-FREE WRITING CANVAS ──────────────── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed inset-0 z-50 p-6 sm:p-12 overflow-y-auto flex flex-col justify-between transition-colors ${
              isDark ? 'bg-[#061209] text-white' : 'bg-[#FAF7F0] text-[#0F2418]'
            }`}
          >
            <div className={`flex justify-between items-center border-b pb-4 ${
              isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-2 ${
                isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
              }`}>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>ZEN DISTRACTION-FREE THINKING CANVAS</span>
              </span>

              <button
                onClick={() => setIsZenMode(false)}
                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-[#13271C] border-[#20422E] text-slate-200 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]'
                }`}
              >
                Exit Zen Mode
              </button>
            </div>

            <div className="max-w-3xl mx-auto w-full my-8 space-y-6">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className={`w-full bg-transparent font-display text-3xl sm:text-5xl font-extrabold outline-none ${
                  isDark ? 'text-white placeholder:text-slate-600' : 'text-[#0F2418] placeholder:text-[#3E5C48]'
                }`}
              />

              <textarea
                autoFocus
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.bodyPlaceholder}
                className={`w-full bg-transparent text-lg sm:text-xl leading-relaxed outline-none resize-none ${
                  isDark ? 'text-slate-200 placeholder:text-slate-600' : 'text-[#0F2418] placeholder:text-[#3E5C48]'
                }`}
              />
            </div>

            <div className={`flex justify-between items-center border-t pt-4 ${
              isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
            }`}>
              <span className={`text-xs font-mono ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{autoSaveStatus}</span>
              <button
                onClick={handleSaveNote}
                className={`px-8 py-3 rounded-full font-bold text-sm cursor-pointer shadow-xl transition-all ${
                  isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                }`}
              >
                {t.saveBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
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
              className={`px-5 py-3 rounded-2xl border text-left transition-all shadow-xl cursor-pointer backdrop-blur-md ${
                isDark ? 'bg-[#0E2517]/90 border-[#4ADE80]/40 hover:border-[#4ADE80]' : 'bg-[#FDFBF7]/90 border-[#E3DDD1] hover:border-[#183B28] shadow-md'
              }`}
            >
              <div className={`flex items-center gap-2 font-bold text-xs ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>
                <Sparkles className="w-4 h-4" />
                <span>{t.zenModeBtn}</span>
              </div>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{t.zenSubtitle}</p>
            </motion.button>
          </div>

        </div>

        {/* ──────────────── 4 GLASS TAB CARDS ──────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('journal')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 shadow-lg ${
              activeTab === 'journal'
                ? isDark
                  ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                  : 'bg-[#E1EFE0] border-[#183B28] ring-1 ring-[#183B28] shadow-md'
                : isDark
                  ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
                  : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] shadow-xs'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
              isDark ? 'bg-[#1A3827] border-[#4ADE80]/40' : 'bg-[#E1EFE0] border-[#C3DEC0]'
            }`}>
              📖
            </div>
            <div>
              <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.tabJournalTitle}</h4>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.tabJournalSub}</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('idea')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'idea'
                ? isDark
                  ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                  : 'bg-[#E1EFE0] border-[#183B28] ring-1 ring-[#183B28] shadow-md'
                : isDark
                  ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
                  : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                isDark ? 'bg-[#1A3827] border-[#4ADE80]/40' : 'bg-[#E1EFE0] border-[#C3DEC0]'
              }`}>
                🌱
              </div>
              <div>
                <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.tabIdeaTitle}</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.tabIdeaSub}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
            }`}>12</span>
          </div>

          <div
            onClick={() => setActiveTab('memory')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'memory'
                ? isDark
                  ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                  : 'bg-[#E1EFE0] border-[#183B28] ring-1 ring-[#183B28] shadow-md'
                : isDark
                  ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
                  : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                isDark ? 'bg-[#1A3827] border-[#4ADE80]/40' : 'bg-[#E1EFE0] border-[#C3DEC0]'
              }`}>
                🫙
              </div>
              <div>
                <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.tabMemoryTitle}</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.tabMemorySub}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
            }`}>8</span>
          </div>

          <div
            onClick={() => setActiveTab('ask')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeTab === 'ask'
                ? isDark
                  ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                  : 'bg-[#E1EFE0] border-[#183B28] ring-1 ring-[#183B28] shadow-md'
                : isDark
                  ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
                  : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                isDark ? 'bg-[#1A3827] border-[#4ADE80]/40' : 'bg-[#E1EFE0] border-[#C3DEC0]'
              }`}>
                💬
              </div>
              <div>
                <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.tabAskTitle}</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.tabAskSub}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
            }`}>3</span>
          </div>
        </div>

        {/* ──────────────── TAB CONTENT AREA: DYNAMIC 4 VIEWS ──────────────── */}
        
        {/* VIEW 1: JOURNAL CANVAS (Writing Form) */}
        {activeTab === 'journal' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className={`flex items-center gap-3 border-b pb-4 ${isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'}`}>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg ${
                isDark ? 'bg-[#1A3827] border-[#4ADE80]/50 text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]'
              }`}>
                🍃
              </div>
              <div>
                <h3 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.newReflectionTitle}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.newReflectionSub}</p>
              </div>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className={`relative flex items-center border rounded-2xl overflow-hidden transition-all ${
                isDark
                  ? 'bg-[#07150C] border-[#20422E] focus-within:border-[#4ADE80]'
                  : 'bg-[#F2ECE1] border-[#E0D8C8] focus-within:border-[#183B28]'
              }`}>
                <div className={`px-4 py-3.5 border-r ${
                  isDark ? 'border-[#20422E] bg-[#0E2015] text-[#4ADE80]' : 'border-[#E0D8C8] bg-[#EDE6D8] text-[#183B28]'
                }`}>
                  🍃
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className={`w-full bg-transparent px-4 py-3.5 text-xs sm:text-sm outline-none ${
                    isDark ? 'text-white placeholder:text-slate-500' : 'text-[#0F2418] placeholder:text-[#3E5C48]'
                  }`}
                />
              </div>

              <div className={`relative flex items-start border rounded-2xl overflow-hidden transition-all ${
                isDark
                  ? 'bg-[#07150C] border-[#20422E] focus-within:border-[#4ADE80]'
                  : 'bg-[#F2ECE1] border-[#E0D8C8] focus-within:border-[#183B28]'
              }`}>
                <div className={`px-4 py-4 border-r self-stretch flex items-start ${
                  isDark ? 'border-[#20422E] bg-[#0E2015] text-[#4ADE80]' : 'border-[#E0D8C8] bg-[#EDE6D8] text-[#183B28]'
                }`}>
                  “
                </div>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t.bodyPlaceholder}
                  className={`w-full bg-transparent p-4 text-xs sm:text-sm outline-none resize-none ${
                    isDark ? 'text-white placeholder:text-slate-500' : 'text-[#0F2418] placeholder:text-[#3E5C48]'
                  }`}
                />
              </div>

              {/* ──────────── PHOTO ATTACHMENT ──────────── */}
              <div>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden max-h-52 bg-black">
                    <img src={photoPreview} alt="Attached field photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className={`absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-black/60 text-[#4ADE80]' : 'bg-black/50 text-white'}`}>
                      📷 Field Photo
                    </div>
                  </div>
                ) : (
                  <label className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-2xl border border-dashed transition-colors w-fit text-xs font-medium ${
                    isDark ? 'border-[#20452F] text-slate-400 hover:border-[#4ADE80] hover:text-[#4ADE80]' : 'border-[#D4CBB8] text-[#3E5C48] hover:border-[#183B28] hover:text-[#183B28]'
                  }`}>
                    <Eye className="w-4 h-4" />
                    <span>Attach Field Photo (optional)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}
              </div>

              <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>

                <div className="space-y-2">
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>{t.moodLabel}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.moodSub}</p>
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
                              ? isDark
                                ? 'bg-[#1A3827] border-2 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20 scale-105'
                                : 'bg-[#E1EFE0] border-2 border-[#183B28] shadow-sm scale-105'
                              : isDark
                                ? 'bg-[#07150C] border border-[#20422E] group-hover:border-[#4ADE80]/50'
                                : 'bg-[#EDE6D8] border border-[#D4CBB8] group-hover:border-[#183B28]'
                          }`}>
                            {m.icon}
                          </div>
                          <span className={`text-[10px] font-semibold ${
                            isSelected ? (isDark ? 'text-[#4ADE80]' : 'text-[#183B28] font-bold') : (isDark ? 'text-slate-400' : 'text-[#3E5C48]')
                          }`}>
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer shrink-0 ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/20' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center text-xs">
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
          </motion.div>
        )}

        {/* VIEW 2: IDEA VAULT */}
        {activeTab === 'idea' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-emerald-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg">
                  🌱
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Idea Vault</h3>
                  <p className="text-xs text-slate-400">12 Stored Ecological Hypotheses & Urban Conservation Ideas</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30">
                12 Ideas Stored
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Rainwater Retention Corridors', tag: '#RainHarvest', text: 'Installing terraced soil basins around Peepal trees to absorb monsoon runoff.' },
                { title: 'Songbird Nesting Canopy', tag: '#SongbirdCorridor', text: 'Preserving old growth Banyan branches for Asian Koel and Parakeet nests.' },
                { title: 'Micro-Fungi Soil Regenerator', tag: '#MicroFungi', text: 'Introducing native mycorrhizal fungi to revive urban soil moisture retention.' },
                { title: 'Urban Heat Island Shield', tag: '#BioShield', text: 'Densely planting Neem and Gulmohar along riverfront walking trails.' },
                { title: 'Night Pollinator Corridor', tag: '#NightSkySense', text: 'Reducing artificial night lighting near Jasmine and Plumbago flower beds.' },
                { title: 'Shade Canopy Temperature Sensor', tag: '#ShadeGarden', text: 'Measuring 3°C drop under dense Tulsi and Banyan tree canopies.' },
                { title: 'Dew Collector Netting', tag: '#DewCollector', text: 'Experimental mesh nets to harvest morning humidity in Gujarat dry months.' },
                { title: 'Pollinator Floral Pathway', tag: '#PollinatorPathway', text: 'Connecting city parks with wildflower strips for honeybee foraging.' },
                { title: 'Native Tree Bark Sponge', tag: '#TreesBark', text: 'Observing how bark textures trap urban dust and humidity.' },
                { title: 'Urban Wildlife Water Basin', tag: '#UrbanWild', text: 'Installing quiet clay water saucers for peacocks and squirrels.' },
                { title: 'Soil Moisture Bio-Indicator', tag: '#SoilRegen', text: 'Using earthworm activity as a metric for healthy garden compost.' },
                { title: 'Autumn Leaf Mulching', tag: '#NativeFlora', text: 'Keeping fallen leaves as natural fertilizer under shade trees.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-2 hover:border-[#4ADE80]/50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#4ADE80] bg-[#1A3827] px-2 py-0.5 rounded-full border border-[#4ADE80]/30">{item.tag}</span>
                    <span className="text-[10px] text-slate-500">Idea #{idx + 1}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: MEMORY CAPSULES */}
        {activeTab === 'memory' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-emerald-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg">
                  🫙
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Memory Capsules</h3>
                  <p className="text-xs text-slate-400">8 Preserved Sensory Time Capsules of Nature Experiences</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30">
                8 Capsules Sealed
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Dawn Peepal Dew Drops', date: 'Aug 15, 2026', mood: 'Quiet Canopy', text: 'Fresh morning condensation glistening on Peepal leaf tips after rain.' },
                { title: 'Peafowl Dawn Call', date: 'Aug 14, 2026', mood: 'Sunlit Meadow', text: 'Resonant peacock calls echoing across Sabarmati Riverfront Park at 6:15 AM.' },
                { title: 'First Monsoon Soil Scent', date: 'Aug 12, 2026', mood: 'Rain Whisper', text: 'The unmistakable petrichor aroma as dry soil absorbs the season first rain.' },
                { title: 'Banyan Canopy Shade Corridor', date: 'Aug 10, 2026', mood: 'Forest Calm', text: 'Stepping into cool 24°C shade under ancient Banyan aerial roots.' },
                { title: 'Golden Shower Blossom Meadow', date: 'Aug 8, 2026', mood: 'Sunlit Meadow', text: 'Bright yellow Cassia flowers carpeting the garden walking path.' },
                { title: 'Night Cricket Symphony', date: 'Aug 5, 2026', mood: 'Evening Hush', text: 'Rhythmic insect soundscape under clear starlit evening sky.' },
                { title: 'Riverfront Heron Flight', date: 'Aug 2, 2026', mood: 'Quiet Canopy', text: 'Graceful white heron gliding low over river water mirror reflection.' },
                { title: 'Tulsi Morning Aroma', date: 'Jul 30, 2026', mood: 'Forest Calm', text: 'Aromatic herbal scent releasing as morning sun warms Tulsi leaves.' },
              ].map((capsule, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-2 hover:border-[#4ADE80]/50 transition-all">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-400 font-bold">🫙 Time Capsule #{idx + 1}</span>
                    <span className="text-slate-400">{capsule.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{capsule.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{capsule.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: ASK MY JOURNAL AI */}
        {activeTab === 'ask' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-emerald-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg">
                  💬
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Ask My Journal AI</h3>
                  <p className="text-xs text-slate-400">Pulse AI analyzes your saved reflections and unlocks ecological insights</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30">
                Pulse AI Ready
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 font-medium">Quick prompt suggestions to ask Pulse AI:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'What patterns did I notice in bird species?',
                  'Summarize my reflections on Banyan tree shade',
                  'Which morning times did I record the most reflections?',
                  'What sensory rain moments did I record?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTitle(`AI Analysis: ${promptText}`);
                      setBody(`Pulse AI Search Analysis: Based on your recorded journal reflections, you frequently observe Peafowls, Koels, and Herons during early morning walks at Sabarmati Riverfront and Parimal Garden. Shade canopy observations show peak relaxation on Wednesday evenings.`);
                      setActiveTab('journal');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#13271C] border border-[#20422E] text-xs font-semibold text-[#4ADE80] hover:bg-[#1A3827] hover:border-[#4ADE80] cursor-pointer transition-all"
                  >
                    ✨ {promptText}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}


        {/* ──────────────── GARY SNYDER QUOTE STRIP ──────────────── */}
        <div className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg border transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-[#06140B] via-[#0E2517] to-[#040C07] border-[#20452F]'
            : 'bg-gradient-to-r from-[#EDE6D8] via-[#FDFBF7] to-[#F2ECE1] border-[#E3DDD1] text-[#0F2418]'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>“</span>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>
              "{t.quoteText}" <span className={`font-bold ml-2 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.quoteAuthor}</span>
            </p>
          </div>
          <Trees className={`w-5 h-5 hidden sm:block ${isDark ? 'text-[#4ADE80]/40' : 'text-[#183B28]/40'}`} />
        </div>

        {/* ──────────────── SAVED JOURNAL ENTRIES SECTION ──────────────── */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                Saved Field Reflections & Observations
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
              }`}>
                {entries.length}
              </span>
            </div>

            {/* Search filter input */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all max-w-xs w-full ${
              isDark ? 'bg-[#0E2015] border-[#20452F] focus-within:border-[#4ADE80]' : 'bg-[#FDFBF7] border-[#E3DDD1] focus-within:border-[#183B28]'
            }`}>
              <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections, species, notes…"
                className={`bg-transparent text-xs outline-none w-full ${isDark ? 'text-white placeholder:text-slate-500' : 'text-[#0F2418] placeholder:text-slate-400'}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-xs text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {entries.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-3 ${
              isDark ? 'bg-[#0E2015] border-[#20452F] text-slate-300' : 'bg-[#FDFBF7] border-[#E3DDD1] text-slate-600'
            }`}>
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl bg-emerald-500/10 border border-emerald-500/20">
                🌿
              </div>
              <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your Nature Journal is Quiet
              </h3>
              <p className="text-xs sm:text-sm max-w-md mx-auto opacity-80 leading-relaxed">
                Write a private thought above or scan a specimen in Nature Lens and tap <b>Save to Journal</b>.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {entries
                .filter((entry) => {
                  if (activeTab === 'idea') return entry.mood === 'Forest Calm' || entry.title?.toLowerCase().includes('idea');
                  if (activeTab === 'memory') return entry.image_url || entry.mood === 'Evening Hush' || entry.title?.toLowerCase().includes('observed');
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return (entry.title || '').toLowerCase().includes(q) || (entry.body || '').toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((entry) => (
                  <motion.div
                    key={entry.id || entry._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl border p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between group ${
                      isDark ? 'bg-[#0E2015] border-[#20452F] hover:border-[#4ADE80]/50' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] shadow-sm'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Header metadata */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                            isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            <Leaf className="w-3 h-3" />
                            <span>{entry.mood || 'Quiet Canopy'}</span>
                          </span>

                          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                            {entry.date || entry.weather}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteEntry(entry.id || entry._id)}
                          title="Delete Note"
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Photo Preview if attached from Nature Lens */}
                      {entry.image_url && (
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] max-h-48 bg-black">
                          <img
                            src={entry.image_url}
                            alt={entry.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                            <Eye className="w-3 h-3 text-[#4ADE80]" />
                            <span>Nature Lens Specimen</span>
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className={`font-display text-xl font-bold leading-snug tracking-tight ${
                        isDark ? 'text-white' : 'text-[#0F2418]'
                      }`}>
                        {entry.title}
                      </h3>

                      {/* Body Content */}
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        isDark ? 'text-slate-300' : 'text-[#2D4836]'
                      }`}>
                        {entry.body}
                      </p>
                    </div>

                    {/* Footer tags */}
                    <div className={`flex items-center justify-between pt-4 mt-4 border-t text-[11px] ${
                      isDark ? 'border-[#1C3A29] text-slate-400' : 'border-[#E3DDD1] text-[#3E5C48]'
                    }`}>
                      <span className="font-mono">
                        {entry.wordCount ? `${entry.wordCount} words` : 'Reflection'}
                      </span>
                      {entry.place_name && (
                        <span className={`font-medium flex items-center gap-1 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>
                          📍 {entry.place_name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
