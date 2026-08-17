import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Award, Compass, MapPin, Globe, BookOpen, Layers, Search, 
  ChevronRight, ChevronLeft, Lock, CheckCircle2, Shield, User, Download, 
  Share2, Eye, EyeOff, Plus, Trash2, Wand2, Star, Zap, Flame, RotateCcw,
  Bookmark, Crown, Printer, FileText, Check, Copy, X, QrCode, ArrowDownToLine,
  SlidersHorizontal, CheckCheck, ExternalLink, Image as ImageIcon, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';

// Multilingual UI Translations for Leather & Gold Passport
const PASSPORT_TRANSLATIONS = {
  en: {
    heroTag: 'GOLD EMBOSSED DUAL-PAGE PASSPORT',
    heroTitle: 'My AI Knowledge Passport',
    heroSubtitle: 'Flip through your digital booklet of achievements, completed missions, and learning milestones.',
    passportLevel: 'Level 4 Knowledge Seeker',
    issueDate: 'ISSUED: AUG 2026',
    passportStatus: 'STATUS: ACTIVE EXPLORER',
    exportPassport: 'Export Passport',
    quickExport: 'Quick PNG',
    nextPageBtn: 'Next Spread →',
    prevPageBtn: '← Previous Spread',
    leftPageTitle: 'OFFICIAL EXPEDITION RECORD',
    rightPageTitle: 'DIGITAL STAMPS & MILESTONES',
    exportModalTitle: 'Official Biodiversity Passport Export',
    exportModalSubtitle: 'Select your preferred high-fidelity format to save, print, or share your verified credentials.',
    tabPng: 'PNG Image',
    tabPdf: 'Print / PDF',
    tabJson: 'JSON Dossier',
    tabCopy: 'Text Summary',
    downloadPngBtn: 'Download Gold PNG Certificate',
    printPdfBtn: 'Print / Save as PDF Document',
    downloadJsonBtn: 'Download JSON Data File',
    copySummaryBtn: 'Copy Formatted Text Card',
    previewTitle: 'Official Certificate Live Preview',
    verifiedSealText: 'VERIFIED CITIZEN SCIENTIST',
    officialRegText: 'GLOBAL BIODIVERSITY REGISTRY • NATURE PULSE AI',
  },
  gu: {
    heroTag: 'ગોલ્ડ એમ્બોસ્ડ ડ્યુઅલ-પેજ પાસપોર્ટ',
    heroTitle: 'મારો એઆઈ નોલેજ પાસપોર્ટ',
    heroSubtitle: 'તમારી સિદ્ધિઓ, પૂર્ણ કરેલા મિશનો અને શીખવાના તબક્કાની ડિજિટલ બુકલેટ.',
    passportLevel: 'લેવલ 4 જ્ઞાન શોધક',
    issueDate: 'ઇશ્યુ તારીખ: ઓગસ્ટ 2026',
    passportStatus: 'સ્થિતિ: સક્રિય સંશોધક',
    exportPassport: 'પાસપોર્ટ નિકાસ કરો',
    quickExport: 'ઝડપી PNG',
    nextPageBtn: 'આગળનું પાનું →',
    prevPageBtn: '← પાછળનું પાનું',
    leftPageTitle: 'સત્તાવાર એક્સપિડિશન રેકોર્ડ',
    rightPageTitle: 'ડિજિટલ સ્ટેમ્પ્સ અને સિદ્ધિઓ',
    exportModalTitle: 'સત્તાવાર પાસપોર્ટ નિકાસ',
    exportModalSubtitle: 'તમારા ચકાસાયેલ ગોલ્ડ-એમ્બોસ્ડ પાસપોર્ટને સાચવવા અથવા પ્રિન્ટ કરવા માટે ફોર્મેટ પસંદ કરો.',
    tabPng: 'PNG ઇમેજ',
    tabPdf: 'પ્રિન્ટ / PDF',
    tabJson: 'JSON ડોઝિયર',
    tabCopy: 'ટેક્સ્ટ સારાંશ',
    downloadPngBtn: 'ગોલ્ડ PNG સર્ટિફિકેટ ડાઉનલોડ કરો',
    printPdfBtn: 'PDF દસ્તાવેજ પ્રિન્ટ / સેવ કરો',
    downloadJsonBtn: 'JSON ડેટા ફાઇલ ડાઉનલોડ કરો',
    copySummaryBtn: 'ફોર્મેટ કરેલ ટેક્સ્ટ કૉપિ કરો',
    previewTitle: 'સત્તાવાર પ્રમાણપત્ર પૂર્વાવલોકન',
    verifiedSealText: 'ચકાસાયેલ નાગરિક વૈજ્ઞાનિક',
    officialRegText: 'ગ્લોબલ બાયોડાયવર્સિટી રજિસ્ટ્રી • NATURE PULSE AI',
  },
  hi: {
    heroTag: 'गोल्ड एम्बोस्ड डुअल-पेज पासपोर्ट',
    heroTitle: 'मेरा एआई ज्ञान पासपोर्ट',
    heroSubtitle: 'आपकी उपलब्धियों, पूरे किए गए मिशनों और सीखने के मील के पत्थरों की डिजिटल बुकलेट।',
    passportLevel: 'लेवल 4 ज्ञान साधक',
    issueDate: 'जारी: अगस्त 2026',
    passportStatus: 'स्थिति: सक्रिय अन्वेषक',
    exportPassport: 'पासपोर्ट निर्यात करें',
    quickExport: 'त्वरित PNG',
    nextPageBtn: 'अगला पृष्ठ →',
    prevPageBtn: '← पिछला पृष्ठ',
    leftPageTitle: 'आधिकारिक अभियान रिकॉर्ड',
    rightPageTitle: 'डिजिटल स्टैम्प और उपलब्धियां',
    exportModalTitle: 'आधिकारिक पासपोर्ट निर्यात',
    exportModalSubtitle: 'अपने सत्यापित गोल्ड-एम्बोस्ड पासपोर्ट को सहेजने या प्रिंट करने के लिए प्रारूप चुनें।',
    tabPng: 'PNG इमेज',
    tabPdf: 'प्रिंट / PDF',
    tabJson: 'JSON डोजियर',
    tabCopy: 'टेक्स्ट सारांश',
    downloadPngBtn: 'गोल्ड PNG प्रमाणपत्र डाउनलोड करें',
    printPdfBtn: 'PDF दस्तावेज़ प्रिंट / सेव करें',
    downloadJsonBtn: 'JSON डेटा फ़ाइल डाउनलोड करें',
    copySummaryBtn: 'स्वरूपित टेक्स्ट कार्ड कॉपी करें',
    previewTitle: 'आधिकारिक प्रमाणपत्र पूर्वावलोकन',
    verifiedSealText: 'सत्यापित नागरिक वैज्ञानिक',
    officialRegText: 'ग्लोबल बायोडायवर्सिटी रजिस्ट्री • NATURE PULSE AI',
  },
};

export default function BiodiversityPassport() {
  const { session, user } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = PASSPORT_TRANSLATIONS[lang] || PASSPORT_TRANSLATIONS.en;
  const token = session?.access_token;

  // Book Spread State (0: Cover & Overview, 1: Stamps & Trail, 2: AI Guide)
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flippedStampId, setFlippedStampId] = useState(null);

  // Export Modal & Flow States
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportTab, setSelectedExportTab] = useState('png'); // 'png' | 'pdf' | 'json' | 'copy'
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [toast, setToast] = useState(null);

  const exportCardRef = useRef(null);

  // Real achievement data
  const [profile, setProfile] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [missions, setMissions] = useState([]);
  const [entries, setEntries] = useState([]);
  const [actions, setActions] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch('/api/profile', {}, token),
      apiFetch('/api/discoveries', {}, token),
      apiFetch('/api/missions', {}, token),
      apiFetch('/api/journal', {}, token),
      apiFetch('/api/actions', {}, token),
      apiFetch('/api/streak', {}, token),
      apiFetch('/api/connection', {}, token),
    ])
      .then(([p, d, m, j, a, s, c]) => {
        setProfile(p);
        setDiscoveries(Array.isArray(d) ? d : []);
        setMissions(Array.isArray(m) ? m : []);
        setEntries(Array.isArray(j) ? j : []);
        setActions(Array.isArray(a) ? a : []);
        setStreakData(s);
        setConnection(c);
      })
      .catch(() => {});
  }, [token]);

  const completedMissions = missions.filter((m) => m.status === 'completed');
  const actionsDone = actions.filter((a) => a.status === 'done' || a.status === 'completed');
  const streakDays = streakData?.streak || 0;
  const xp = completedMissions.length * 150 + actionsDone.length * 25;
  const score = connection?.overall || 0;

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const issueDate = `ISSUED: ${fmtDate(profile?.createdAt || new Date().toISOString()).toUpperCase()}`;

  // Unique / Stable Passport ID Number
  const passportNumber = user?.id 
    ? `NP-${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`
    : profile?.id
      ? `NP-${String(profile.id).padStart(8, '0').slice(-8).toUpperCase()}`
      : 'NP-84920412';

  const displayStamps = [
    discoveries.length > 0 && { id: 'st-d', title: 'ECO DISCOVERY 🌿', date: fmtDate(discoveries[discoveries.length - 1]?.createdAt), category: 'Discoveries', xp: 220, desc: `${discoveries.length} field observation${discoveries.length === 1 ? '' : 's'} recorded with the Lens.`, icon: '🌿' },
    completedMissions.length > 0 && { id: 'st-m', title: 'MISSION MASTER ⚡', date: fmtDate(completedMissions[completedMissions.length - 1]?.completed_at || completedMissions[completedMissions.length - 1]?.createdAt), category: 'Missions', xp: 250, desc: `Completed ${completedMissions.length} challenge${completedMissions.length === 1 ? '' : 's'}.`, icon: '⚡' },
    entries.length > 0 && { id: 'st-j', title: 'FIELD NOTES 📖', date: fmtDate(entries[entries.length - 1]?.createdAt), category: 'Journal', xp: 150, desc: `${entries.length} private reflection${entries.length === 1 ? '' : 's'} written.`, icon: '📖' },
    actionsDone.length > 0 && { id: 'st-a', title: 'ACTIVE GUARDIAN 🛡️', date: fmtDate(actionsDone[actionsDone.length - 1]?.updatedAt || actionsDone[actionsDone.length - 1]?.createdAt), category: 'Actions', xp: 200, desc: `${actionsDone.length} eco action${actionsDone.length === 1 ? '' : 's'} logged.`, icon: '🛡️' },
    streakDays > 0 && { id: 'st-k', title: `${Math.min(streakDays, 7)}-DAY STREAK 🔥`, date: 'Current', category: 'Streaks', xp: 300, desc: `Active ${streakDays} day${streakDays === 1 ? '' : 's'} in a row.`, icon: '🔥' },
  ].filter(Boolean);

  const level = score >= 80
    ? 'Eco Guardian'
    : score >= 50
      ? 'Level 3 Explorer'
      : score > 0
        ? 'Level 1 Beginner'
        : 'Ready to Begin';

  const journeyItems = [
    discoveries.length > 0 && { title: 'First Observation', desc: `${discoveries[discoveries.length - 1]?.common_name || 'Field observation'} recorded with Nature Lens.`, date: fmtDate(discoveries[discoveries.length - 1]?.createdAt) },
    completedMissions.length > 0 && { title: 'First Completed Mission', desc: `Completed "${completedMissions[completedMissions.length - 1]?.title}".`, date: fmtDate(completedMissions[completedMissions.length - 1]?.completed_at || completedMissions[completedMissions.length - 1]?.createdAt) },
    entries.length > 0 && { title: 'First Field Note', desc: 'Wrote your first private reflection.', date: fmtDate(entries[entries.length - 1]?.createdAt) },
    actionsDone.length > 0 && { title: 'First Eco Action', desc: `Logged "${actionsDone[actionsDone.length - 1]?.title}".`, date: fmtDate(actionsDone[actionsDone.length - 1]?.updatedAt || actionsDone[actionsDone.length - 1]?.createdAt) },
  ].filter(Boolean);

  const progressPct = Math.min(100, displayStamps.length * 15 + (score > 0 ? 10 : 0));

  // Toast Notification Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Trigger celebratory confetti
  const triggerCelebration = () => {
    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#E6C176', '#D4A359', '#10B981', '#F59E0B', '#34D399', '#FFF8DE']
        });
      }
    } catch (err) {
      console.warn('Confetti trigger skipped:', err);
    }
  };

  // 1. Download High-Res PNG Passport Card
  const handleDownloadPng = async () => {
    if (!exportCardRef.current) return;
    try {
      setIsExporting(true);
      setExportStatus('Rendering High-Res Gold Passport PNG…');

      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(exportCardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });

      const explorerName = profile?.display_name || user?.name || 'Explorer';
      const cleanName = explorerName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `NaturePulse_Biodiversity_Passport_${cleanName}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerCelebration();
      showToast('🌟 Gold Passport PNG successfully downloaded!');
    } catch (err) {
      console.error('PNG export failed:', err);
      showToast('⚠️ Failed to generate PNG image. You can use Print/PDF instead.', 'error');
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  // 2. Print / Save as PDF
  const handlePrintPdf = () => {
    try {
      setIsExporting(true);
      setExportStatus('Preparing printable document…');

      setTimeout(() => {
        window.print();
        setIsExporting(false);
        setExportStatus('');
        triggerCelebration();
        showToast('🖨️ Passport document sent to Print / PDF Save!');
      }, 300);
    } catch (err) {
      console.error('Print failed:', err);
      setIsExporting(false);
      setExportStatus('');
      showToast('⚠️ Print could not be opened automatically.', 'error');
    }
  };

  // 3. Download Structured JSON Dossier
  const handleDownloadJson = () => {
    try {
      setIsExporting(true);
      const explorerName = profile?.display_name || user?.name || 'Explorer';
      const cleanName = explorerName.replace(/[^a-zA-Z0-9_-]/g, '_');

      const dossier = {
        document: 'NaturePulse AI Biodiversity Passport',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        passportId: passportNumber,
        explorer: {
          name: explorerName,
          email: user?.email || undefined,
          level: level,
          issueDate: issueDate,
          streakDays: streakDays,
          totalXp: xp,
          ecoScore: score,
          status: 'ACTIVE_CITIZEN_SCIENTIST'
        },
        telemetry: {
          discoveriesCount: discoveries.length,
          missionsCompletedCount: completedMissions.length,
          journalEntriesCount: entries.length,
          actionsDoneCount: actionsDone.length,
          stampsCount: displayStamps.length,
          progressPercentage: progressPct
        },
        stamps: displayStamps,
        journeyTrail: journeyItems,
        discoveries: discoveries.map((d) => ({
          id: d.id,
          commonName: d.common_name,
          scientificName: d.scientific_name,
          category: d.category,
          date: d.createdAt
        })),
        completedMissions: completedMissions.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          xp: m.xp,
          completedAt: m.completed_at || m.createdAt
        })),
        verification: {
          status: 'VERIFIED CITIZEN SCIENTIST',
          authority: 'NaturePulse Global Biodiversity Registry',
          securityHash: `NP-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dossier, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `NaturePulse_Passport_Dossier_${cleanName}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerCelebration();
      showToast('📜 Full JSON Dossier downloaded successfully!');
    } catch (err) {
      console.error('JSON export error:', err);
      showToast('⚠️ Failed to export JSON dossier.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Copy Formatted Markdown / Text Summary
  const handleCopySummary = () => {
    try {
      const explorerName = profile?.display_name || user?.name || 'Explorer';
      const text = `🌍 NATURE PULSE • OFFICIAL BIODIVERSITY PASSPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Explorer: ${explorerName}
🎖️ Rank: ${level}
🆔 Passport ID: ${passportNumber}
📅 Status: ACTIVE CITIZEN SCIENTIST (${new Date().toLocaleDateString()})

📊 EXPEDITION STATS:
• Digital Stamps Earned: ${displayStamps.length}
• Missions Completed: ${completedMissions.length}
• Total Observations: ${discoveries.length}
• Field Notes Written: ${entries.length}
• Eco Actions Logged: ${actionsDone.length}
• Active Streak: ${streakDays} Day${streakDays === 1 ? '' : 's'} 🔥
• Total Knowledge XP: ${xp.toLocaleString()} XP ⚡
• Nature Connection Score: ${score}% 🌿

✨ Verified by Nature Pulse Global Biodiversity Network`;

      navigator.clipboard.writeText(text);
      triggerCelebration();
      showToast('📋 Passport Summary copied to clipboard!');
    } catch (err) {
      console.error('Copy summary error:', err);
      showToast('⚠️ Clipboard write failed.', 'error');
    }
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#060D09] text-slate-100 selection:bg-[#E6C176]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-amber-200 selection:text-amber-950'
    }`}>
      
      {/* ──────────────── FLOATING TOAST NOTIFICATION ──────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-500/50 text-rose-100'
                : 'bg-[#12271C]/95 border-[#E6C176]/80 text-[#FFF8DE]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#E6C176] shrink-0 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-amber-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── LEATHER & GOLD EMBOSSED HEADER ──────────────── */}
        <div className={`relative rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-2 transition-all ${
          isDark
            ? 'bg-gradient-to-r from-[#14261B] via-[#1D3828] to-[#122419] border-[#E6C176]/50'
            : 'bg-gradient-to-r from-[#173A25] via-[#204E33] to-[#173A25] border-amber-400/60 shadow-xl'
        }`}>
          
          <div className="space-y-2 max-w-xl z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2A4B36] text-[#E6C176] border border-[#E6C176]/40 text-xs font-extrabold uppercase tracking-widest shadow-md">
              <Crown className="w-3.5 h-3.5 text-[#E6C176]" />
              {t.heroTag}
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8DE] via-[#E6C176] to-[#B89240] tracking-tight drop-shadow-md">
              {t.heroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4 z-10 shrink-0">
            {/* Main Export Passport Modal Opener */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportModal(true)}
              disabled={isExporting}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs sm:text-sm hover:brightness-110 transition-all shadow-xl shadow-[#E6C176]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? (exportStatus || 'Exporting…') : t.exportPassport}</span>
            </motion.button>
          </div>

        </div>

        {/* ──────────────── SPREAD NAVIGATION CONTROLS ──────────────── */}
        <div className={`flex items-center justify-between rounded-2xl px-6 py-3 text-xs font-bold border transition-colors ${
          isDark
            ? 'bg-[#112318] border-[#E6C176]/30 text-[#E6C176]'
            : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#916B25] shadow-md'
        }`}>
          <button
            onClick={() => setSpreadIndex((s) => Math.max(s - 1, 0))}
            disabled={spreadIndex === 0}
            className={`flex items-center gap-1.5 disabled:opacity-30 cursor-pointer ${
              isDark ? 'hover:text-white text-[#E6C176]' : 'hover:text-[#183B28] text-[#916B25]'
            }`}
          >
            <span>{t.prevPageBtn}</span>
          </button>

          <span className={`font-mono text-sm tracking-widest font-bold ${
            isDark ? 'text-white' : 'text-[#0F2418]'
          }`}>
            SPREAD 0{spreadIndex + 1} / 03
          </span>

          <button
            onClick={() => setSpreadIndex((s) => Math.min(s + 1, 2))}
            disabled={spreadIndex === 2}
            className={`flex items-center gap-1.5 disabled:opacity-30 cursor-pointer ${
              isDark ? 'hover:text-white text-[#E6C176]' : 'hover:text-[#183B28] text-[#916B25]'
            }`}
          >
            <span>{t.nextPageBtn}</span>
          </button>
        </div>

        {/* ──────────────── REALISTIC DUAL-PAGE BOOKLET SPREAD ──────────────── */}
        <div className={`rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden border-4 transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#254532]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
        }`}>
          
          <AnimatePresence mode="wait">
            
            {/* 📖 SPREAD 01: LEFT (IDENTITY & OVERVIEW) + RIGHT (SUMMARY & XP) */}
            {spreadIndex === 0 && (
              <motion.div
                key="sp0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
              >
                {/* LEFT PAGE: PASSPORT HOLDER IDENTITY CARD */}
                <div className={`rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl relative border transition-colors ${
                  isDark ? 'bg-[#12271C] border-[#E6C176]/40' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                }`}>
                  <div className={`border-b pb-4 flex justify-between items-center ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}>
                    <span className="text-[10px] font-black text-[#B89240] dark:text-[#E6C176] uppercase tracking-widest">
                      {t.leftPageTitle}
                    </span>
                    <span className="text-xs text-[#916B25] dark:text-amber-300 font-bold font-mono">OFFICIAL #{passportNumber}</span>
                  </div>

                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isDark ? 'bg-[#0A1A10] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                  }`}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D3828] to-[#14261B] border-2 border-[#E6C176] flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                      👤
                    </div>
                    <div>
                      <h3 className={`font-display text-xl font-black ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{profile?.display_name || user?.name || 'Nature Pulse Explorer'}</h3>
                      <p className="text-xs text-[#916B25] dark:text-[#E6C176] font-semibold">{level}</p>
                      <p className="text-[10px] text-[#3E5C48] dark:text-slate-400 mt-1 font-mono">{issueDate}</p>
                    </div>
                  </div>

                  <div className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>
                    <div className={`flex justify-between py-1 border-b ${isDark ? 'border-[#20422E]' : 'border-[#E0D8C8]'}`}>
                      <span>Primary Language:</span>
                      <span className="text-[#183B28] dark:text-[#E6C176] font-bold">English, ગુજરાતી & Hindi</span>
                    </div>
                    <div className={`flex justify-between py-1 border-b ${isDark ? 'border-[#20422E]' : 'border-[#E0D8C8]'}`}>
                      <span>Active Streak:</span>
                      <span className="text-[#183B28] dark:text-emerald-400 font-bold">{streakDays} Day{streakDays === 1 ? '' : 's'} 🔥</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Total Earned XP:</span>
                      <span className="text-[#916B25] dark:text-amber-400 font-bold">{xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT PAGE: PASSPORT MILESTONES SUMMARY */}
                <div className={`rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl relative border transition-colors ${
                  isDark ? 'bg-[#12271C] border-[#E6C176]/40' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                }`}>
                  <div className={`border-b pb-4 flex justify-between items-center ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}>
                    <span className="text-[10px] font-black text-[#B89240] dark:text-[#E6C176] uppercase tracking-widest">
                      {t.rightPageTitle}
                    </span>
                    <span className="text-xs text-[#183B28] dark:text-emerald-400 font-bold">VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: 'Stamps Earned', val: `${displayStamps.length} Stamps`, icon: '🎖️' },
                      { title: 'Missions Completed', val: `${completedMissions.length} Missions`, icon: '⚡' },
                      { title: 'Field Notes', val: `${entries.length} Notes`, icon: '📚' },
                      { title: 'Eco Score', val: `${score}% Connection`, icon: '🌿' },
                    ].map((m, i) => (
                      <div key={i} className={`p-3.5 rounded-xl space-y-1 border ${
                        isDark ? 'bg-[#0A1A10] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                      }`}>
                        <span className="text-lg">{m.icon}</span>
                        <p className="text-[10px] text-[#3E5C48] uppercase font-semibold">{m.title}</p>
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{m.val}</h4>
                      </div>
                    ))}
                  </div>

                  <div className={`p-4 rounded-xl space-y-2 border ${
                    isDark ? 'bg-[#0A1A10] border-[#E6C176]/30' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                  }`}>
                    <div className="flex justify-between text-xs text-[#916B25] dark:text-[#E6C176] font-bold">
                      <span>Passport Document Progress</span>
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-[#12271C]' : 'bg-[#EDE6D8]'
                    }`}>
                      <div className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 📖 SPREAD 02: STAMPS GALLERY (LEFT & RIGHT) */}
            {spreadIndex === 1 && (
              <motion.div
                key="sp1"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className={`border-b pb-3 flex justify-between items-center ${
                  isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                }`}>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Digital Journey Stamps Collection</h3>
                  <span className="text-xs text-[#916B25] dark:text-[#E6C176] font-bold">Hover Card to 3D Flip</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayStamps.length === 0 ? (
                    <p className={`text-xs rounded-2xl p-6 text-center col-span-full border border-dashed ${
                      isDark ? 'text-slate-400 bg-[#12271C] border-[#E6C176]/30' : 'text-[#3E5C48] bg-[#FDFBF7] border-[#E3DDD1]'
                    }`}>
                      Your achievement stamps appear here as you record observations, finish missions, write journal notes, and log eco actions.
                    </p>
                  ) : (
                  displayStamps.map((st) => {
                    const isFlipped = flippedStampId === st.id;
                    return (
                      <div
                        key={st.id}
                        className="perspective-1000 h-44 cursor-pointer"
                        onMouseEnter={() => setFlippedStampId(st.id)}
                        onMouseLeave={() => setFlippedStampId(null)}
                      >
                        <motion.div
                          className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                          {/* FRONT SIDE */}
                          <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 flex flex-col justify-between border ${
                            isDark ? 'bg-[#12271C] border-[#E6C176]/50 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-md'
                          }`}>
                            <div className="flex justify-between items-start">
                              <span className="text-3xl">{st.icon}</span>
                              <span className="text-xs font-black text-[#916B25] dark:text-[#E6C176]">+{st.xp} XP</span>
                            </div>
                            <div>
                              <h4 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{st.title}</h4>
                              <p className={`text-[10px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{st.date}</p>
                            </div>
                          </div>

                          {/* BACK SIDE */}
                          <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 flex flex-col justify-between border ${
                            isDark ? 'bg-[#1D3828] border-[#E6C176] text-slate-200' : 'bg-[#FAF2E4] border-[#D4A359] text-[#0F2418] shadow-md'
                          }`}>
                            <div>
                              <h5 className="font-display text-xs font-bold text-[#916B25] dark:text-[#E6C176]">{st.category}</h5>
                              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>{st.desc}</p>
                            </div>
                            <span className="text-[10px] text-[#183B28] dark:text-emerald-400 font-bold">Verified Achievement</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  }))}
                </div>
              </motion.div>
            )}

            {/* 📖 SPREAD 03: JOURNEY TRAIL TIMELINE */}
            {spreadIndex === 2 && (
              <motion.div
                key="sp2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={`font-display text-2xl font-bold border-b pb-3 ${
                  isDark ? 'text-white border-[#20452F]' : 'text-[#0F2418] border-[#E3DDD1]'
                }`}>
                  Chronological Journey Trail
                </h3>

                <div className="space-y-3">
                  {journeyItems.length === 0 ? (
                    <p className={`text-xs rounded-2xl p-6 text-center border border-dashed ${
                      isDark ? 'text-slate-400 bg-[#12271C] border-[#E6C176]/30' : 'text-[#3E5C48] bg-[#FDFBF7] border-[#E3DDD1]'
                    }`}>
                      Your journey trail begins with your first observation.
                    </p>
                  ) : (
                  journeyItems.map((tr, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                      isDark ? 'bg-[#12271C] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3828] to-[#14261B] border border-[#E6C176] flex items-center justify-center text-xs font-bold text-[#E6C176] shrink-0 font-mono">
                        0{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{tr.title}</h4>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{tr.desc}</p>
                      </div>
                      <span className="text-[10px] text-[#916B25] dark:text-[#E6C176] font-bold font-mono">{tr.date}</span>
                    </div>
                  ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* ──────────────── OFFICIAL EXPORT MODAL ──────────────── */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto no-print"
            onClick={() => !isExporting && setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0C1B12] border-2 border-[#E6C176]/50 shadow-2xl text-slate-100 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[#20452F] flex items-center justify-between bg-gradient-to-r from-[#14291D] to-[#0D1D13]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6C176] to-[#B89240] flex items-center justify-center text-[#0A160F] shadow-lg">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      {t.exportModalTitle}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#20452F] text-[#E6C176] border border-[#E6C176]/30 uppercase font-mono">
                        Official AI Dossier
                      </span>
                    </h3>
                    <p className="text-xs text-amber-200/70">{t.exportModalSubtitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format Switcher Tabs */}
              <div className="px-6 pt-4 pb-2 border-b border-[#20452F] flex flex-wrap items-center gap-2 bg-[#09150E]">
                {[
                  { id: 'png', label: t.tabPng, icon: ImageIcon, desc: 'High-Res Gold PNG' },
                  { id: 'pdf', label: t.tabPdf, icon: Printer, desc: 'Printable Certificate' },
                  { id: 'json', label: t.tabJson, icon: FileText, desc: 'Full JSON Dossier' },
                  { id: 'copy', label: t.tabCopy, icon: Copy, desc: 'Shareable Text Card' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedExportTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedExportTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#E6C176] text-[#0A160F] shadow-lg shadow-[#E6C176]/20 font-black'
                          : 'bg-[#12271C] text-slate-300 hover:text-white hover:bg-[#1A3828] border border-[#20452F]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Body & Live Certificate Preview */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#07110A]">
                
                {/* 🌟 OFFICIAL PASSPORT CERTIFICATE RENDERED FOR DISPLAY & HTML-TO-IMAGE CAPTURE */}
                <div className="flex justify-center">
                  <div
                    ref={exportCardRef}
                    id="printable-passport-certificate"
                    className="w-full max-w-[760px] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border-4 border-[#D4A359] text-white"
                    style={{
                      background: 'radial-gradient(circle at top right, #1A3D28 0%, #0D2015 60%, #07130C 100%)',
                      fontFamily: "'Source Sans 3', sans-serif"
                    }}
                  >
                    {/* Security Guilloche Inner Border */}
                    <div className="absolute inset-2 rounded-2xl border border-[#E6C176]/30 pointer-events-none" />
                    <div className="absolute inset-3.5 rounded-xl border border-dashed border-[#E6C176]/20 pointer-events-none" />

                    {/* Watermark Crest */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-[220px]">
                      🌿
                    </div>

                    {/* Certificate Top Header */}
                    <div className="relative z-10 border-b border-[#E6C176]/40 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6C176] via-[#B89240] to-[#8C6B28] p-0.5 shadow-lg shrink-0">
                          <div className="w-full h-full rounded-[14px] bg-[#0C1B12] flex items-center justify-center text-xl font-bold">
                            👑
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#E6C176]">
                            GLOBAL BIODIVERSITY CITIZEN REGISTRY
                          </p>
                          <h2 className="font-display text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-[#E6C176] to-[#D4A359]">
                            Official AI Knowledge Passport
                          </h2>
                        </div>
                      </div>

                      <div className="text-right flex flex-row sm:flex-col justify-between sm:justify-center items-end">
                        <span className="font-mono text-xs font-black text-[#E6C176] tracking-widest">
                          {passportNumber}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          ✓ VERIFIED CITIZEN SCIENTIST
                        </span>
                      </div>
                    </div>

                    {/* Certificate Content Grid */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
                      
                      {/* Left: Explorer Identity Box (5 cols) */}
                      <div className="md:col-span-5 rounded-2xl p-4 bg-[#0A1A10]/90 border border-[#E6C176]/30 space-y-4 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E432D] to-[#122A1C] border-2 border-[#E6C176] flex items-center justify-center text-2xl shadow-inner shrink-0">
                            👤
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display text-lg font-black text-white truncate">
                              {profile?.display_name || user?.name || 'Nature Pulse Explorer'}
                            </h4>
                            <p className="text-xs font-bold text-[#E6C176]">{level}</p>
                            <p className="text-[9px] font-mono text-slate-400">{issueDate}</p>
                          </div>
                        </div>

                        {/* Telemetry Metrics Pill List */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#20452F] text-slate-300">
                            <span>Active Streak:</span>
                            <span className="font-bold text-emerald-400">{streakDays} Days 🔥</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#20452F] text-slate-300">
                            <span>Total Knowledge:</span>
                            <span className="font-bold text-[#E6C176] font-mono">{xp.toLocaleString()} XP</span>
                          </div>
                          <div className="flex justify-between py-1 text-slate-300">
                            <span>Nature Connection:</span>
                            <span className="font-bold text-emerald-300">{score}% Overall</span>
                          </div>
                        </div>

                        {/* Hologram Badge */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#173824] to-[#11291A] border border-[#E6C176]/30 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#E6C176] font-bold">STATUS: ACTIVE</span>
                          <span className="text-[10px] text-amber-200">ID: {passportNumber}</span>
                        </div>
                      </div>

                      {/* Right: Key Milestones & Stamps Grid (7 cols) */}
                      <div className="md:col-span-7 space-y-4">
                        
                        {/* 4 Key Counters */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Observations', val: discoveries.length, icon: '🌿' },
                            { label: 'Missions', val: completedMissions.length, icon: '⚡' },
                            { label: 'Field Notes', val: entries.length, icon: '📖' },
                            { label: 'Eco Actions', val: actionsDone.length, icon: '🛡️' },
                          ].map((item, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-[#0A1A10]/90 border border-[#20452F] text-center">
                              <span className="text-sm">{item.icon}</span>
                              <div className="font-mono text-xs font-black text-white">{item.val}</div>
                              <div className="text-[8px] text-slate-400 uppercase font-semibold truncate">{item.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Earned Stamp Badges Strip */}
                        <div className="rounded-2xl p-3.5 bg-[#0A1A10]/90 border border-[#E6C176]/30 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#E6C176] uppercase">
                            <span>Official Journey Stamps</span>
                            <span className="font-mono">{displayStamps.length} Earned</span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {displayStamps.slice(0, 6).map((st) => (
                              <div key={st.id} className="p-2 rounded-xl bg-[#122A1C] border border-[#E6C176]/40 flex items-center gap-2">
                                <span className="text-base shrink-0">{st.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold text-white truncate">{st.title.replace(/[^\w\s-]/g, '')}</div>
                                  <div className="text-[8px] text-[#E6C176] font-mono">+{st.xp} XP</div>
                                </div>
                              </div>
                            ))}
                            {displayStamps.length === 0 && (
                              <div className="col-span-3 text-[10px] text-slate-400 p-2 text-center">
                                Initializing citizen scientist expedition stamps…
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Certificate Footer Seal & Security Barcode */}
                    <div className="relative z-10 border-t border-[#E6C176]/30 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#E6C176]" />
                        <span>NaturePulse Biodiversity Network • Cryptographically Sealed</span>
                      </div>
                      <div className="font-mono text-amber-200/80 text-[9px] tracking-wider">
                        SEC-{Math.random().toString(36).substring(2, 8).toUpperCase()}-NP2026
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 py-4 border-t border-[#20452F] bg-[#0A160F] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-amber-200/80 flex items-center gap-2">
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6C176]" />
                      <span className="font-bold">{exportStatus || 'Generating file…'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E6C176]" />
                      <span>Ready to export in high fidelity format.</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    className="px-5 py-2.5 rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {t.closeBtn || 'Close'}
                  </button>

                  {selectedExportTab === 'png' && (
                    <button
                      onClick={handleDownloadPng}
                      disabled={isExporting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs hover:brightness-110 shadow-lg shadow-[#E6C176]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>{t.downloadPngBtn}</span>
                    </button>
                  )}

                  {selectedExportTab === 'pdf' && (
                    <button
                      onClick={handlePrintPdf}
                      disabled={isExporting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs hover:brightness-110 shadow-lg shadow-[#E6C176]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4 stroke-[2.5]" />
                      <span>{t.printPdfBtn}</span>
                    </button>
                  )}

                  {selectedExportTab === 'json' && (
                    <button
                      onClick={handleDownloadJson}
                      disabled={isExporting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs hover:brightness-110 shadow-lg shadow-[#E6C176]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 stroke-[2.5]" />
                      <span>{t.downloadJsonBtn}</span>
                    </button>
                  )}

                  {selectedExportTab === 'copy' && (
                    <button
                      onClick={handleCopySummary}
                      disabled={isExporting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs hover:brightness-110 shadow-lg shadow-[#E6C176]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Copy className="w-4 h-4 stroke-[2.5]" />
                      <span>{t.copySummaryBtn}</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
