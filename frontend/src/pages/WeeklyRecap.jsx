import { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Sparkles, Calendar, TrendingUp, Clock, Globe, Award, 
  Target, Download, Share2, CheckCircle2, ChevronRight, ChevronLeft, Zap, RefreshCw, 
  Flame, BookOpen, User, Star, Plus, Trash2, ArrowUpRight, BarChart2, ShieldCheck,
  Compass, Radio, Disc, Archive, Lightbulb, FileText, Image as ImageIcon,
  FileCode, Table, QrCode, Copy, Check, Eye, ExternalLink, X, MapPin, Feather,
  Layers, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton, FallbackImg } from '../components/ui';

// Multilingual UI Translations
const RECAP_TRANSLATIONS = {
  en: {
    heroTag: 'HOLOGRAM INTELLIGENCE SPHERE',
    heroTitle: 'Weekly Activity Cosmos',
    heroSubtitle: 'An interactive reflection of your exploration, conversations, topics, and progress over the past 7 days.',
    aiSummaryTitle: 'AI Weekly Memory Synthesis',
    tabTimeline: 'S-Curve Timeline',
    tabTopics: 'Constellation Galaxy',
    tabGoals: 'Weekly Goals',
    tabArchive: 'Recap Vault',
    mostActiveDay: 'Most Active Day',
    speciesLogged: 'Species Logged',
    observationsCount: 'Total Observations',
    habitatsExplored: 'Habitats Explored',
    ecoScoreTitle: 'Eco Score',
    goalsTitle: 'Weekly Exploration Goals',
    addGoalBtn: '+ Add Goal',
    exportRecapBtn: 'Export Center',
    saveToVaultBtn: 'Save to Vault',
    savedInVault: 'Saved in Vault',
    currentWeek: 'This Week',
    prevWeek: 'Previous Week',
    nextWeek: 'Next Week',
    activeDays: 'Active Days',
    filterAll: 'All',
    viewSnapshot: 'View Full Recap',
    deleteSnapshot: 'Delete',
    noSnapshots: 'No saved recap snapshots yet in your vault.',
    noSnapshotsSub: 'Save your weekly recaps to build your long-term ecological archive.',
    noSpeciesYet: 'No observations recorded in this week window.',
    noSpeciesSub: 'Use Nature Lens to document local flora & fauna and watch your constellation ignite.',
    intensityLabel: 'Intensity',
  },
  gu: {
    heroTag: 'હોલોગ્રામ ઇન્ટેલિજન્સ સ્ફિયર',
    heroTitle: 'સાપ્તાહિક પ્રવૃત્તિ કોસ્મોસ',
    heroSubtitle: 'છેલ્લા 7 દિવસના તમારા સંશોધન, વાતચીત, વિષયો અને પ્રગતિનું ઇન્ટરેક્ટિવ પ્રતિબિંબ.',
    aiSummaryTitle: 'એઆઈ મેમરી સિન્થેસિસ',
    tabTimeline: 'એસ-કર્વ ટાઇમલાઇન',
    tabTopics: 'કોન્સ્ટેલેશન ગેલેક્સી',
    tabGoals: 'સાપ્તાહિક લક્ષ્યો',
    tabArchive: 'રીકેપ વોલ્ટ',
    mostActiveDay: 'સૌથી સક્રિય દિવસ',
    speciesLogged: 'નોંધાયેલી પ્રજાતિઓ',
    observationsCount: 'કુલ અવલોકનો',
    habitatsExplored: 'અભ્યાસ કરેલ વિસ્તારો',
    ecoScoreTitle: 'ઇકો સ્કોર',
    goalsTitle: 'સાપ્તાહિક લક્ષ્યો',
    addGoalBtn: '+ લક્ષ્ય ઉમેરો',
    exportRecapBtn: 'નિકાસ કેન્દ્ર',
    saveToVaultBtn: 'વોલ્ટમાં સાચવો',
    savedInVault: 'વોલ્ટમાં સાચવેલ',
    currentWeek: 'આ અઠવાડિયું',
    prevWeek: 'પાછલું અઠવાડિયું',
    nextWeek: 'આગલું અઠવાડિયું',
    activeDays: 'સક્રિય દિવસો',
    filterAll: 'બધા',
    viewSnapshot: 'સંપૂર્ણ રીકેપ જુઓ',
    deleteSnapshot: 'કાઢી નાખો',
    noSnapshots: 'તમારા વોલ્ટમાં હજુ કોઈ સાચવેલા રીકેપ નથી.',
    noSnapshotsSub: 'તમારો દીર્ઘકાલીન પર્યાવરણીય આર્કાઇવ બનાવવા માટે સાપ્તાહિક રીકેપ સાચવો.',
    noSpeciesYet: 'આ અઠવાડિયામાં હજુ સુધી કોઈ પ્રવૃત્તિ નોંધાઈ નથી.',
    noSpeciesSub: 'સ્થાનિક વનસ્પતિ અને પ્રાણીસૃષ્ટિ રેકોર્ડ કરવા માટે નેચર લેન્સનો ઉપયોગ કરો.',
    intensityLabel: 'તીવ્રતા',
  },
  hi: {
    heroTag: 'होलोग्राम इंटेलिजेंस स्फीयर',
    heroTitle: 'साप्ताहिक गतिविधि कॉसमॉस',
    heroSubtitle: 'पिछले 7 दिनों की आपकी खोज, बातचीत, विषयों और प्रगति का इंटरैक्टिव प्रतिबिंब।',
    aiSummaryTitle: 'एआई मेमोरी सिंथेसिस',
    tabTimeline: 'एस-कर्व टाइमलाइन',
    tabTopics: 'कॉन्स्टिलेशन गैलेक्सी',
    tabGoals: 'साप्ताहिक लक्ष्य',
    tabArchive: 'रीकैप वॉल्ट',
    mostActiveDay: 'सबसे सक्रिय दिन',
    speciesLogged: 'प्रजाति दर्ज',
    observationsCount: 'कुल अवलोकन',
    habitatsExplored: 'खोजे गए पर्यावास',
    ecoScoreTitle: 'इको स्कोर',
    goalsTitle: 'साप्ताहिक खोज लक्ष्य',
    addGoalBtn: '+ लक्ष्य जोड़ें',
    exportRecapBtn: 'निर्यात केंद्र',
    saveToVaultBtn: 'वॉल्ट में सहेजें',
    savedInVault: 'वॉल्ट में सहेजा गया',
    currentWeek: 'इस सप्ताह',
    prevWeek: 'पिछला सप्ताह',
    nextWeek: 'अगला सप्ताह',
    activeDays: 'सक्रिय दिन',
    filterAll: 'सभी',
    viewSnapshot: 'पूरा रीकैप देखें',
    deleteSnapshot: 'हटाएं',
    noSnapshots: 'आपके वॉल्ट में अभी तक कोई सहेजा गया रीकैप नहीं है।',
    noSnapshotsSub: 'अपना दीर्घकालिक पारिस्थितिक संग्रह बनाने के लिए साप्ताहिक रीकैप सहेजें।',
    noSpeciesYet: 'इस सप्ताह कोई अवलोकन दर्ज नहीं किया गया है।',
    noSpeciesSub: 'प्रकृति के अवलोकन रिकॉर्ड करने के लिए नेचर लेंस का उपयोग करें।',
    intensityLabel: 'तीव्रता',
  },
};

// Curated Goal Suggestions
const GOAL_SUGGESTIONS = [
  '🌳 Identify 3 native tree canopies in your area',
  '🐦 Log a morning birdsong observation at dawn',
  '🌸 Document 2 wildflower pollinators or butterflies',
  '💧 Visit and observe a local wetland or water body',
  '📖 Write a mindful 5-minute nature reflection in journal',
  '🌱 Complete 1 community conservation action',
];

export default function WeeklyRecap() {
  const { session } = useAuth();
  const { isDark } = useTheme();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = RECAP_TRANSLATIONS[lang] || RECAP_TRANSLATIONS.en;
  const token = session?.access_token;

  // Navigation & View State
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current, -1 = last week, etc.
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, topics, goals, archive
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // 0..6 (default to latest day)
  const [selectedSpeciesStar, setSelectedSpeciesStar] = useState(null);
  const [galaxyCategoryFilter, setGalaxyCategoryFilter] = useState('all');
  const [isViewingSavedSnapshot, setIsViewingSavedSnapshot] = useState(false);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Weekly Data State
  const [recapData, setRecapData] = useState(null);
  const [vaultSnapshots, setVaultSnapshots] = useState([]);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

  // Goals State (synced with profile)
  const [goals, setGoals] = useState([]);
  const [goalsFilter, setGoalsFilter] = useState('all'); // all, active, completed
  const [newGoalText, setNewGoalText] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const goalsLoadedRef = useRef(false);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('txt'); // txt, pdf, png, json, csv, share
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const printableCardRef = useRef(null);

  // Auto-dismiss toast messages
  useEffect(() => {
    if (actionSuccessMsg) {
      const timer = setTimeout(() => setActionSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessMsg]);

  // Fetch Weekly Recap Data
  const loadWeeklyRecap = (offset = 0) => {
    setLoading(true);
    setError('');
    setIsViewingSavedSnapshot(false);

    apiFetch(`/api/weekly-recap?weekOffset=${offset}&lang=${lang}`, {}, token)
      .then((data) => {
        if (data && !data.failed) {
          setRecapData(data);
          if (Array.isArray(data.goals)) {
            setGoals(data.goals);
            goalsLoadedRef.current = true;
          }
          if (data.timeline && data.timeline.length > 0) {
            setSelectedDayIndex(data.timeline.length - 1);
          }
        } else {
          setError('Failed to fetch weekly activity data.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error loading weekly recap data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch Vault Snapshots
  const loadVaultSnapshots = () => {
    apiFetch('/api/weekly-recap/snapshots', {}, token)
      .then((snaps) => {
        if (Array.isArray(snaps)) {
          setVaultSnapshots(snaps);
        }
      })
      .catch(() => {});
  };

  // Initial Data Load and upon weekOffset changes
  useEffect(() => {
    loadWeeklyRecap(weekOffset);
    loadVaultSnapshots();
  }, [weekOffset, token, lang]);

  // Sync goals updates to backend profile
  useEffect(() => {
    if (!goalsLoadedRef.current) return;
    const timeout = setTimeout(() => {
      apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ weekly_goals: goals }) }, token)
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timeout);
  }, [goals, token]);

  // Goal Handlers
  const handleToggleGoal = (id) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
      const total = next.length;
      const completed = next.filter((g) => g.done).length;
      if (total > 0 && completed === total) {
        // Trigger celebratory confetti
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const handleAddGoal = (textToAdd) => {
    const text = typeof textToAdd === 'string' ? textToAdd : newGoalText;
    if (!text || !text.trim()) return;
    const newG = { id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: text.trim(), done: false };
    setGoals((prev) => [...prev, newG]);
    setNewGoalText('');
    setShowGoalInput(false);
    setActionSuccessMsg('Goal added to weekly checklist!');
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Save current week snapshot to Vault
  const handleSaveToVault = async () => {
    if (!recapData || isSavingSnapshot) return;
    setIsSavingSnapshot(true);
    try {
      const payload = {
        week_id: recapData.week_id,
        week_label: recapData.week_label,
        start_date: recapData.start_date,
        end_date: recapData.end_date,
        snapshot_data: recapData,
      };
      const res = await apiFetch('/api/weekly-recap/snapshots', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);

      if (res && res.snapshot) {
        setRecapData((prev) => ({ ...prev, is_saved_in_vault: true, saved_snapshot_id: res.snapshot._id }));
        loadVaultSnapshots();
        setActionSuccessMsg('✨ Weekly recap snapshot saved into your Vault!');
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      }
    } catch (err) {
      setError('Could not save snapshot to vault. Please try again.');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  // Delete snapshot from Vault
  const handleDeleteSnapshot = async (id) => {
    try {
      await apiFetch(`/api/weekly-recap/snapshots/${id}`, { method: 'DELETE' }, token);
      setVaultSnapshots((prev) => prev.filter((s) => s._id !== id));
      if (recapData?.saved_snapshot_id === id) {
        setRecapData((prev) => ({ ...prev, is_saved_in_vault: false, saved_snapshot_id: null }));
      }
      setActionSuccessMsg('Snapshot removed from vault.');
    } catch (err) {
      setError('Could not delete snapshot.');
    }
  };

  // View a saved snapshot in the live dashboard
  const handleViewSavedSnapshot = (snapshot) => {
    if (snapshot?.snapshot_data) {
      setRecapData(snapshot.snapshot_data);
      setIsViewingSavedSnapshot(true);
      setActiveTab('timeline');
      setActionSuccessMsg(`Viewing saved snapshot for ${snapshot.week_label}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Active timeline node
  const activeTimelineNode = recapData?.timeline?.[selectedDayIndex] || recapData?.timeline?.[recapData.timeline.length - 1] || null;

  // Filtered Constellation Nodes
  const filteredConstellationNodes = useMemo(() => {
    if (!recapData?.constellation?.nodes) return [];
    if (galaxyCategoryFilter === 'all') return recapData.constellation.nodes;
    return recapData.constellation.nodes.filter(
      (n) => n.type === 'core' || n.category === galaxyCategoryFilter
    );
  }, [recapData, galaxyCategoryFilter]);

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    if (goalsFilter === 'active') return goals.filter((g) => !g.done);
    if (goalsFilter === 'completed') return goals.filter((g) => g.done);
    return goals;
  }, [goals, goalsFilter]);

  // Real Goals Calculation
  const goalsTotalCount = goals.length;
  const goalsDoneCount = goals.filter((g) => g.done).length;
  const goalsPct = goalsTotalCount > 0 ? Math.round((goalsDoneCount / goalsTotalCount) * 100) : 0;

  // Generate QR Code when export modal opens for Share format
  useEffect(() => {
    if (showExportModal) {
      const shareUrl = window.location.href;
      QRCode.toDataURL(shareUrl, { width: 220, margin: 1, color: { dark: '#0F2418', light: '#FFFFFF' } })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [showExportModal]);

  // ──────────────── EXPORT CENTER HANDLERS ────────────────
  const handleExecuteExport = async () => {
    if (!recapData) return;
    setIsExporting(true);
    setExportSuccess(false);

    const filenameBase = `NaturePulse_Weekly_Recap_${recapData.week_id || new Date().toISOString().slice(0, 10)}`;

    try {
      if (exportFormat === 'txt') {
        // Formatted Text Export
        const txtContent = `=====================================================
🌱 NATUREPULSE WEEKLY ACTIVITY RECAP
Week: ${recapData.week_label}
Date Generated: ${new Date().toLocaleString()}
=====================================================

📊 KEY SUMMARY & METRICS
• Eco Score: ${recapData.eco_score}/100 (${recapData.eco_rank || 'Naturalist'})
• Active Days: ${recapData.active_days} of 7 days
• Unique Species Logged: ${recapData.total_species}
• Total Observations: ${recapData.total_observations}
• Most Active Day: ${recapData.most_active_day} (${recapData.most_active_count} activities)
• Habitats Explored: ${recapData.places_count} locations
• Goals Achieved: ${goalsDoneCount} of ${goalsTotalCount} (${goalsPct}%)

🌱 AI ECOLOGICAL SYNTHESIS
"${recapData.summary}"

🌿 SPECIES DOCUMENTED THIS WEEK
${recapData.species_list && recapData.species_list.length > 0
  ? recapData.species_list.map((s, idx) => `  ${idx + 1}. ${s.name} (${s.scientific_name || s.category}) - ${s.count} observation(s), ${s.highest_confidence}% confidence`).join('\n')
  : '  No species documented this week.'}

📅 7-DAY ACTIVITY TIMELINE
${recapData.timeline && recapData.timeline.length > 0
  ? recapData.timeline.map((d) => `  • ${d.fullDay}: ${d.observations} obs, ${d.journals} journals, ${d.missions} missions (Intensity: ${d.intensity}%) - ${d.highlight}`).join('\n')
  : '  No daily activity logs.'}

🎯 WEEKLY GOALS & PROGRESS
${goals.length > 0
  ? goals.map((g) => `  [${g.done ? 'X' : ' '}] ${g.text}`).join('\n')
  : '  No weekly goals recorded.'}

=====================================================
Generated by NaturePulse Ecological Relationship Platform
https://naturepulse.org
=====================================================`;

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filenameBase}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportSuccess(true);
      } else if (exportFormat === 'json') {
        // JSON Export
        const jsonPayload = {
          app: 'NaturePulse',
          version: '2.0',
          exported_at: new Date().toISOString(),
          recap: recapData,
          goals: goals,
        };
        const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filenameBase}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportSuccess(true);
      } else if (exportFormat === 'csv') {
        // CSV Export
        const headers = ['Species Common Name', 'Scientific Name', 'Category', 'Observation Count', 'AI Confidence %', 'Places Visited'];
        const rows = (recapData.species_list || []).map((sp) => [
          `"${(sp.name || '').replace(/"/g, '""')}"`,
          `"${(sp.scientific_name || '').replace(/"/g, '""')}"`,
          `"${(sp.category || '').replace(/"/g, '""')}"`,
          sp.count,
          `${sp.highest_confidence}%`,
          `"${(sp.places || []).join('; ').replace(/"/g, '""')}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filenameBase}_species.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportSuccess(true);
      } else if (exportFormat === 'pdf') {
        // PDF Export via jsPDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Header Banner
        doc.setFillColor(15, 36, 24); // #0F2418
        doc.rect(0, 0, 210, 36, 'F');

        doc.setTextColor(74, 222, 128); // Emerald #4ADE80
        doc.setFontSize(10);
        doc.text('NATUREPULSE ECOLOGICAL INTELLIGENCE', 14, 12);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('Weekly Activity Recap Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(200, 220, 210);
        doc.text(`Week: ${recapData.week_label}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Eco Score & Primary Metrics Section
        doc.setFillColor(242, 236, 225);
        doc.roundedRect(14, 42, 182, 34, 4, 4, 'F');

        doc.setTextColor(15, 36, 24);
        doc.setFontSize(11);
        doc.text('ECO SCORE & PERFORMANCE', 20, 50);

        doc.setFontSize(22);
        doc.setTextColor(37, 82, 57);
        doc.text(`${recapData.eco_score}/100`, 20, 62);

        doc.setFontSize(9);
        doc.setTextColor(70, 90, 80);
        doc.text(`Rank: ${recapData.eco_rank || 'Naturalist'}`, 20, 69);

        // Metrics Columns
        doc.setFontSize(10);
        doc.setTextColor(15, 36, 24);
        doc.text(`Active Days: ${recapData.active_days}/7`, 80, 52);
        doc.text(`Species Logged: ${recapData.total_species}`, 80, 60);
        doc.text(`Total Observations: ${recapData.total_observations}`, 80, 68);

        doc.text(`Most Active Day: ${recapData.most_active_day}`, 135, 52);
        doc.text(`Habitats Explored: ${recapData.places_count}`, 135, 60);
        doc.text(`Goals Completed: ${goalsDoneCount}/${goalsTotalCount} (${goalsPct}%)`, 135, 68);

        // AI Synthesis Narrative
        doc.setFontSize(12);
        doc.setTextColor(15, 36, 24);
        doc.text('Ecological Synthesis', 14, 86);

        doc.setFontSize(9.5);
        doc.setTextColor(50, 70, 60);
        const splitSummary = doc.splitTextToSize(`"${recapData.summary}"`, 182);
        doc.text(splitSummary, 14, 93);

        let curY = 93 + splitSummary.length * 5 + 8;

        // Species Catalog Section
        doc.setFontSize(12);
        doc.setTextColor(15, 36, 24);
        doc.text('Species Documented This Week', 14, curY);
        curY += 6;

        if (recapData.species_list && recapData.species_list.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(70, 80, 75);
          recapData.species_list.slice(0, 10).forEach((sp, idx) => {
            const line = `${idx + 1}. ${sp.name} (${sp.scientific_name || sp.category}) — ${sp.count} observation(s) • ${sp.highest_confidence}% confidence`;
            doc.text(line, 14, curY);
            curY += 5;
          });
        } else {
          doc.setFontSize(9);
          doc.text('No species recorded this week.', 14, curY);
          curY += 6;
        }

        curY += 6;

        // 7-Day Timeline Summary
        doc.setFontSize(12);
        doc.setTextColor(15, 36, 24);
        doc.text('7-Day Activity Breakdown', 14, curY);
        curY += 6;

        if (recapData.timeline) {
          doc.setFontSize(8.5);
          doc.setTextColor(60, 70, 65);
          recapData.timeline.forEach((d) => {
            doc.text(`• ${d.fullDay}: ${d.observations} obs, ${d.journals} journals (Intensity ${d.intensity}%) — ${d.highlight}`, 14, curY);
            curY += 4.8;
          });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(140, 150, 145);
        doc.text('NaturePulse • Ecological Relationship Platform • naturepulse.org', 14, 285);

        doc.save(`${filenameBase}.pdf`);
        setExportSuccess(true);
      } else if (exportFormat === 'png') {
        // Image Export via html-to-image
        if (printableCardRef.current) {
          const dataUrl = await htmlToImage.toPng(printableCardRef.current, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: isDark ? '#040B06' : '#FAF7F0',
          });
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${filenameBase}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setExportSuccess(true);
        }
      } else if (exportFormat === 'share') {
        // Web Share API or Clipboard Copy
        const shareText = `🌱 NaturePulse Weekly Recap (${recapData.week_label})\n`
          + `• Eco Score: ${recapData.eco_score}/100 (${recapData.eco_rank})\n`
          + `• Species Logged: ${recapData.total_species}\n`
          + `• Observations: ${recapData.total_observations}\n`
          + `• Most Active Day: ${recapData.most_active_day}\n`
          + `• Summary: "${recapData.summary}"\n\n`
          + `Explore your local biodiversity: ${window.location.origin}/app/recap`;

        if (navigator.share) {
          await navigator.share({
            title: 'NaturePulse Weekly Activity Recap',
            text: shareText,
            url: window.location.href,
          });
          setExportSuccess(true);
        } else {
          await navigator.clipboard.writeText(shareText);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 3000);
          setExportSuccess(true);
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try a different format or check permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">

        {/* Global Toast Success Message */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg('')} className="p-1 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {error && (
          <div className="space-y-3">
            <ErrorBanner message={error} />
          </div>
        )}

        {/* Viewing Saved Snapshot Banner */}
        {isViewingSavedSnapshot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDark ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Vault Snapshot Mode</p>
                <p className="text-xs sm:text-sm">You are viewing the archived snapshot for <strong>{recapData?.week_label}</strong>.</p>
              </div>
            </div>
            <button
              onClick={() => loadWeeklyRecap(0)}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all cursor-pointer shrink-0"
            >
              Return to Live Week
            </button>
          </motion.div>
        )}

        {/* ──────────────── WEEK SELECTOR & CONTROL BAR ──────────────── */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 backdrop-blur-md transition-colors ${
          isDark ? 'bg-[#0E2015]/80 border-[#20422E]' : 'bg-[#FDFBF7]/90 border-[#E3DDD1] shadow-xs'
        }`}>
          {/* Week Shift Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80] text-slate-200' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
              }`}
              title={t.prevWeek}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                weekOffset === 0
                  ? isDark ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#183B28] text-white border-[#183B28]'
                  : isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418]'
              }`}
            >
              {t.currentWeek}
            </button>

            <button
              onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
              disabled={weekOffset === 0}
              className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80] text-slate-200' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
              }`}
              title={t.nextWeek}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className={`text-xs sm:text-sm font-semibold ml-2 ${isDark ? 'text-emerald-400' : 'text-[#183B28]'}`}>
              {recapData?.week_label || 'Loading week…'}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save to Vault Button */}
            <button
              onClick={handleSaveToVault}
              disabled={isSavingSnapshot || recapData?.is_saved_in_vault}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75 ${
                recapData?.is_saved_in_vault
                  ? isDark ? 'bg-[#1A3827] text-emerald-400 border-emerald-500/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                  : isDark ? 'bg-[#13271C] hover:bg-[#1A3827] text-white border-[#20422E]' : 'bg-[#F2ECE1] hover:bg-[#EAE2D2] text-[#0F2418] border-[#E0D8C8]'
              }`}
              title="Save a snapshot of this week's data to your vault"
            >
              {recapData?.is_saved_in_vault ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.savedInVault}</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>{isSavingSnapshot ? 'Saving…' : t.saveToVaultBtn}</span>
                </>
              )}
            </button>

            {/* Export Center Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-white hover:bg-[#255239]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportRecapBtn}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => loadWeeklyRecap(weekOffset)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80] text-slate-300' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* ──────────────── CELESTIAL ORBITAL HOLOGRAM SPHERE HEADER ──────────────── */}
        <div className={`relative flex flex-col md:flex-row items-center justify-between gap-8 py-6 px-4 sm:px-8 border-b transition-colors ${
          isDark ? 'border-[#20452F]/60' : 'border-[#E3DDD1]'
        }`}>
          
          {/* Left Orbital Text */}
          <div className="space-y-3 text-center md:text-left max-w-lg z-10">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md border ${
              isDark ? 'bg-[#0E2618] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
            }`}>
              <Radio className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              {t.heroTag}
            </span>
            
            <h1 className={`font-display text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text tracking-tight leading-tight ${
              isDark
                ? 'bg-gradient-to-r from-white via-emerald-100 to-[#4ADE80]'
                : 'bg-gradient-to-r from-[#0F2418] via-[#183B28] to-[#255239]'
            }`}>
              {t.heroTitle}
            </h1>
            
            <p className={`text-xs sm:text-sm font-normal leading-relaxed ${
              isDark ? 'text-slate-300/90' : 'text-[#3E5C48]'
            }`}>
              {t.heroSubtitle}
            </p>

            {/* Quick Badges Bar */}
            <div className="pt-2 flex flex-wrap justify-center md:justify-start items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isDark ? 'bg-[#13271C] border-[#20422E] text-emerald-400' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#183B28]'
              }`}>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {recapData?.eco_rank || 'Seedling Scout'}
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#3E5C48]'
              }`}>
                {recapData?.active_days || 0} / 7 Active Days
              </span>
            </div>
          </div>

          {/* Right Holographic Glowing Sphere Ring with 7 Weekday Orbs */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className={`absolute inset-0 rounded-full border-2 border-dashed ${
                isDark ? 'border-[#4ADE80]/40' : 'border-[#183B28]/40'
              }`}
            />
            
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute inset-4 rounded-full blur-xl ${
                isDark ? 'bg-[#4ADE80]/20' : 'bg-[#E1EFE0]/60'
              }`}
            />

            <div className={`w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center text-center shadow-2xl relative z-10 space-y-0.5 ${
              isDark
                ? 'bg-gradient-to-br from-[#1A3827] via-[#0E2015] to-[#040B06] border-[#4ADE80]'
                : 'bg-gradient-to-br from-[#EDE6D8] via-[#FDFBF7] to-[#F2ECE1] border-[#183B28] shadow-xl'
            }`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.ecoScoreTitle}</span>
              <span className={`font-display text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>
                {recapData?.eco_score !== undefined ? `${recapData.eco_score}%` : '--'}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#0E2015] text-emerald-300' : 'bg-[#E1EFE0] text-[#183B28]'}`}>
                {recapData?.active_days || 0} Days Active
              </span>
            </div>

            {/* 7 Orbiting Weekday Satellite Nodes */}
            {recapData?.timeline?.map((n, idx) => {
              const angle = (idx * 360) / 7;
              const rad = (angle * Math.PI) / 180;
              const radius = 115; // px from center
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              const isSelected = selectedDayIndex === idx;

              return (
                <button
                  key={n.date || idx}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    setActiveTab('timeline');
                  }}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer z-20 ${
                    isSelected
                      ? isDark
                        ? 'bg-[#4ADE80] text-[#07130B] border-white shadow-lg shadow-[#4ADE80]/40 scale-125'
                        : 'bg-[#183B28] text-[#FAF7F0] border-[#0F2418] shadow-md scale-125'
                      : isDark
                        ? 'bg-[#13271C] text-slate-200 border-[#20422E] hover:border-[#4ADE80]'
                        : 'bg-[#FDFBF7] text-[#0F2418] border-[#D4CBB8] hover:border-[#183B28] shadow-xs'
                  }`}
                  title={`${n.fullDay}: ${n.observations} obs, ${n.journals} journals`}
                >
                  {n.day[0]}
                </button>
              );
            })}
          </div>

        </div>

        {/* ──────────────── AI MEMORY SYNTHESIS BANNER ──────────────── */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#4ADE80]/50 text-white' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418] shadow-sm'
        }`}>
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 animate-pulse ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              <h3 className={`font-display text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.aiSummaryTitle}</h3>
            </div>
            <p className={`text-xs sm:text-sm italic font-normal leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>
              "{recapData?.summary || 'Generating weekly ecological intelligence synthesis…'}"
            </p>
          </div>

          <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${
            isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#FDFBF7] text-[#183B28] border-[#C3DEC0]'
          }`}>
            {recapData?.week_label || 'Current Week'}
          </span>
        </div>

        {/* ──────────────── ASYMMETRIC FLOATING CAPSULE METRICS ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Capsule 1: Most Active Day */}
          <div className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.mostActiveDay}</p>
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div>
              <h3 className={`font-display text-2xl font-extrabold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                {recapData?.most_active_day || '—'}
              </h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                {recapData?.most_active_count > 0 ? `${recapData.most_active_count} weekly activities` : 'No activity logged'}
              </p>
            </div>
          </div>

          {/* Capsule 2: Species Logged */}
          <div className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.speciesLogged}</p>
              <Feather className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div>
              <h3 className={`font-display text-2xl font-extrabold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                {recapData?.total_species || 0} Species
              </h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                across {recapData?.total_observations || 0} total observations
              </p>
            </div>
          </div>

          {/* Capsule 3: Habitats Explored */}
          <div className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.habitatsExplored}</p>
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div>
              <h3 className={`font-display text-2xl font-extrabold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                {recapData?.places_count || 0} Habitats
              </h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                {recapData?.places_explored?.slice(0, 2).join(', ') || 'Local territory'}
              </p>
            </div>
          </div>

          {/* Capsule 4: Weekly Goals Progress */}
          <div className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Goals Progress</p>
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className={`font-display text-2xl font-extrabold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  {goalsPct}%
                </h3>
                <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-[#183B28]'}`}>
                  {goalsDoneCount}/{goalsTotalCount} Done
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/20 mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                  style={{ width: `${goalsPct}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'timeline', label: t.tabTimeline, icon: Zap },
            { id: 'topics', label: t.tabTopics, icon: Compass },
            { id: 'goals', label: t.tabGoals, icon: Target },
            { id: 'archive', label: `${t.tabArchive} (${vaultSnapshots.length})`, icon: Archive },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                      : 'bg-[#183B28] text-[#FAF7F0] shadow-md'
                    : isDark
                      ? 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                      : 'bg-[#FDFBF7] border border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1] shadow-xs'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ──────────────── TAB 1: S-CURVE INTERACTIVE TIMELINE ──────────────── */}
        {activeTab === 'timeline' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  S-Curve Weekly Timeline Journey
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Visualizing dynamic activity flow, observations, and reflection cadence.
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
              }`}>
                {recapData?.total_observations || 0} Total Weekly Logs
              </span>
            </div>

            {/* S-Curve SVG Spline Chart */}
            <div className="relative w-full h-40 sm:h-48 my-4">
              <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="scurve-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#4ADE80" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>

                {/* Background Grid Lines */}
                <line x1="20" y1="130" x2="680" y2="130" stroke={isDark ? '#20422E' : '#E3DDD1'} strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20" y1="75" x2="680" y2="75" stroke={isDark ? '#20422E' : '#E3DDD1'} strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20" y1="20" x2="680" y2="20" stroke={isDark ? '#20422E' : '#E3DDD1'} strokeWidth="1" strokeDasharray="4 4" />

                {/* S-Curve Path Generated from Timeline Intensity */}
                {(() => {
                  const points = (recapData?.timeline || []).map((node, i) => {
                    const x = 50 + (i * 600) / 6;
                    // Invert intensity for Y coordinate (0% = 130px, 100% = 25px)
                    const intensity = Math.max(8, node.intensity || 0);
                    const y = 130 - (intensity / 100) * 105;
                    return { x, y, ...node };
                  });

                  if (points.length < 2) return null;

                  // Build smooth bezier path
                  let d = `M ${points[0].x} ${points[0].y}`;
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i];
                    const p1 = points[i + 1];
                    const cx = (p0.x + p1.x) / 2;
                    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  const areaD = `${d} L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z`;

                  return (
                    <>
                      {/* Gradient Fill */}
                      <path d={areaD} fill="url(#scurve-grad)" />
                      {/* Main Spline Curve */}
                      <path d={d} fill="none" stroke="url(#line-grad)" strokeWidth="4" strokeLinecap="round" />
                      {/* Interactive Point Nodes */}
                      {points.map((pt, idx) => {
                        const isSel = selectedDayIndex === idx;
                        return (
                          <g key={pt.date || idx} className="cursor-pointer" onClick={() => setSelectedDayIndex(idx)}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isSel ? 8 : 5}
                              className={`transition-all ${
                                isSel
                                  ? 'fill-white stroke-[#4ADE80] stroke-[3px]'
                                  : 'fill-[#183B28] stroke-emerald-400 stroke-[2px] hover:r-7'
                              }`}
                            />
                            {/* Value Label */}
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              className={`text-[10px] font-bold ${
                                isSel
                                  ? isDark ? 'fill-[#4ADE80]' : 'fill-[#183B28]'
                                  : isDark ? 'fill-slate-400' : 'fill-[#3E5C48]'
                              }`}
                            >
                              {pt.totalActivity}
                            </text>
                            {/* Day Label */}
                            <text
                              x={pt.x}
                              y={148}
                              textAnchor="middle"
                              className={`text-[11px] font-semibold ${
                                isSel
                                  ? isDark ? 'fill-white font-bold' : 'fill-[#0F2418] font-bold'
                                  : isDark ? 'fill-slate-400' : 'fill-[#3E5C48]'
                              }`}
                            >
                              {pt.day}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* 7 Days Selector Cards */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-center">
              {recapData?.timeline?.map((node, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <motion.button
                    key={node.date || idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#1A3827] border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20'
                          : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28] shadow-md ring-1 ring-[#183B28]'
                        : isDark
                          ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/40'
                          : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{node.day}</span>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? isDark ? 'bg-[#4ADE80] text-[#07130B] border-white' : 'bg-[#183B28] text-white border-[#0F2418]'
                        : isDark ? 'bg-[#1A3827] border-[#4ADE80]/40 text-white' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28]'
                    }`}>
                      {node.totalActivity}
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                      {node.observations} obs
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Day Deep Dive Breakdown Drawer */}
            {activeTimelineNode && (
              <motion.div
                key={activeTimelineNode.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 space-y-4 border transition-colors ${
                  isDark ? 'bg-[#13271C] border-[#4ADE80]/40' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}
              >
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 ${
                  isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                }`}>
                  <div>
                    <h4 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                      {activeTimelineNode.fullDay} Activity Breakdown
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                      Focus: {activeTimelineNode.topCategory ? `${activeTimelineNode.topCategory.toUpperCase()} observation` : 'General exploration'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                    }`}>
                      {activeTimelineNode.intensity}% Intensity
                    </span>
                  </div>
                </div>

                <p className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Highlight: {activeTimelineNode.highlight}</span>
                </p>

                {/* Detailed Items Log for this Day */}
                {activeTimelineNode.items && activeTimelineNode.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {activeTimelineNode.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                          isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-white border-[#E0D8C8]'
                        }`}
                      >
                        {item.image_url ? (
                          <FallbackImg
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-emerald-500/20"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === 'journal' ? 'bg-amber-500/20 text-amber-400' :
                            item.type === 'mission' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.type === 'journal' ? <BookOpen className="w-5 h-5" /> :
                             item.type === 'mission' ? <Target className="w-5 h-5" /> : <Feather className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{item.title}</p>
                          <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{item.subtitle || item.category}</p>
                          {item.place && (
                            <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" /> {item.place}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                    No specific field logs recorded for this day. Head out with the Lens to make discoveries.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 2: CONSTELLATION GALAXY ──────────────── */}
        {activeTab === 'topics' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  Topic & Species Constellation Galaxy
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Dynamic star map connecting your weekly observations and biodiversity clusters.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'birds', 'trees', 'flowers', 'insects', 'fungi', 'mammals'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalaxyCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                      galaxyCategoryFilter === cat
                        ? isDark ? 'bg-[#4ADE80] text-[#07130B] font-bold' : 'bg-[#183B28] text-white font-bold'
                        : isDark ? 'bg-[#13271C] text-slate-300 hover:bg-[#1A3827]' : 'bg-[#F2ECE1] text-[#3E5C48] hover:bg-[#EAE2D2]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Constellation Star Map / Visual Grid */}
            {recapData?.species_list && recapData.species_list.length > 0 ? (
              <div className="space-y-6">
                {/* Visual Galaxy Star Cluster */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recapData.species_list
                    .filter((sp) => galaxyCategoryFilter === 'all' || sp.category === galaxyCategoryFilter)
                    .map((sp, idx) => (
                      <motion.div
                        key={sp.id || idx}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedSpeciesStar(sp)}
                        className={`p-5 rounded-2xl space-y-3 transition-all cursor-pointer shadow-md border relative overflow-hidden ${
                          isDark
                            ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]'
                            : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]'
                        }`}
                      >
                        {/* Glow indicator */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

                        <div className="flex justify-between items-start">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                          }`}>
                            {sp.category}
                          </span>
                          <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-[#183B28]'}`}>
                            {sp.highest_confidence}% confidence
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {sp.image_url ? (
                            <FallbackImg
                              src={sp.image_url}
                              alt={sp.name}
                              className="w-14 h-14 rounded-xl object-cover border border-emerald-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Feather className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className={`font-display text-base font-bold truncate ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                              {sp.name}
                            </h4>
                            <p className={`text-xs italic truncate ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                              {sp.scientific_name || sp.category}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-emerald-400' : 'text-[#183B28]'}`}>
                              {sp.count} observation{sp.count === 1 ? '' : 's'} recorded
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {/* Species Star Inspection Modal */}
                <AnimatePresence>
                  {selectedSpeciesStar && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                      onClick={() => setSelectedSpeciesStar(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className={`max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 border shadow-2xl relative ${
                          isDark ? 'bg-[#0E2015] border-[#4ADE80] text-white' : 'bg-[#FAF7F0] border-[#183B28] text-[#0F2418]'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedSpeciesStar(null)}
                          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/20 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                          }`}>
                            {selectedSpeciesStar.category}
                          </span>
                          <span className="text-xs font-semibold">
                            {selectedSpeciesStar.highest_confidence}% AI Confidence
                          </span>
                        </div>

                        {selectedSpeciesStar.image_url && (
                          <FallbackImg
                            src={selectedSpeciesStar.image_url}
                            alt={selectedSpeciesStar.name}
                            className="w-full h-48 sm:h-56 rounded-2xl object-cover border border-emerald-500/30"
                          />
                        )}

                        <div>
                          <h3 className="font-display text-2xl font-bold">{selectedSpeciesStar.name}</h3>
                          <p className="text-sm italic text-emerald-400">{selectedSpeciesStar.scientific_name}</p>
                        </div>

                        {selectedSpeciesStar.notes && (
                          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>
                            {selectedSpeciesStar.notes}
                          </p>
                        )}

                        {selectedSpeciesStar.places && selectedSpeciesStar.places.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Habitats Observed</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedSpeciesStar.places.map((pl, idx) => (
                                <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 ${
                                  isDark ? 'bg-[#13271C] text-slate-200' : 'bg-[#F2ECE1] text-[#0F2418]'
                                }`}>
                                  <MapPin className="w-3 h-3 text-emerald-400" /> {pl}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Compass className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-display text-xl font-bold">{t.noSpeciesYet}</h4>
                <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  {t.noSpeciesSub}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 3: WEEKLY GOALS PLANNER ──────────────── */}
        {activeTab === 'goals' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 ${
              isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
            }`}>
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.goalsTitle}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Set, track, and complete personal ecological exploration goals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGoalInput((v) => !v)}
                  className={`px-4 py-2 rounded-full font-bold text-xs cursor-pointer transition-all ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                  }`}
                >
                  {t.addGoalBtn}
                </button>
              </div>
            </div>

            {/* Goals Progress Meter Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
            }`}>
              <div className="space-y-1 w-full sm:w-2/3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Weekly Milestone Completion</span>
                  <span className={isDark ? 'text-emerald-400' : 'text-[#183B28]'}>{goalsPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalsPct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                {['all', 'active', 'completed'].map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setGoalsFilter(flt)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      goalsFilter === flt
                        ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white'
                        : isDark ? 'bg-[#1A3827] text-slate-300' : 'bg-[#EAE2D2] text-[#0F2418]'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Goal Input Form */}
            {showGoalInput && (
              <form onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }} className="flex items-center gap-2">
                <input
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g., Identify 3 native tree canopies or log a morning birdsong..."
                  className={`flex-1 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]'
                      : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs cursor-pointer shrink-0 ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0]'
                  }`}
                >
                  Save Goal
                </button>
              </form>
            )}

            {/* Quick Suggestions Chips */}
            <div className="space-y-2">
              <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                Quick Suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddGoal(sug)}
                    className={`px-3 py-1.5 rounded-xl text-xs border text-left transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80] text-slate-300 hover:text-white'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
                    }`}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Goals List */}
            <div className="space-y-2.5">
              {filteredGoals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleToggleGoal(g.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    g.done
                      ? isDark
                        ? 'bg-[#1A3827] border-[#4ADE80]/60 text-slate-300'
                        : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418]'
                      : isDark
                        ? 'bg-[#13271C] border-[#20422E] text-white hover:border-[#4ADE80]/40'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:border-[#183B28]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-all ${
                      g.done
                        ? isDark ? 'bg-[#4ADE80] border-[#4ADE80] text-[#07130B] font-bold' : 'bg-[#183B28] border-[#183B28] text-white'
                        : isDark ? 'border-slate-500' : 'border-slate-400'
                    }`}>
                      {g.done && '✓'}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${g.done ? 'line-through opacity-75' : ''}`}>
                      {g.text}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(g.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredGoals.length === 0 && (
                <p className={`text-xs rounded-2xl p-6 text-center border border-dashed ${
                  isDark ? 'text-slate-400 bg-[#13271C] border-[#20422E]' : 'text-[#3E5C48] bg-[#F2ECE1] border-[#D4CBB8]'
                }`}>
                  No goals match the selected filter. Click "+ Add Goal" or pick a suggestion above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 4: RECAP VAULT ARCHIVE ──────────────── */}
        {activeTab === 'archive' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-4">
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  {t.tabArchive}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Historical repository of all your saved weekly recaps and biological snapshots.
                </p>
              </div>

              <button
                onClick={handleSaveToVault}
                disabled={isSavingSnapshot || recapData?.is_saved_in_vault}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-white hover:bg-[#255239]'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{recapData?.is_saved_in_vault ? 'Current Week Saved' : 'Save Current Week to Vault'}</span>
              </button>
            </div>

            {/* Snapshots Grid */}
            {vaultSnapshots.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Archive className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-display text-xl font-bold">{t.noSnapshots}</h4>
                <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  {t.noSnapshotsSub}
                </p>
                <button
                  onClick={handleSaveToVault}
                  className={`mt-3 px-5 py-2 rounded-full font-bold text-xs ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white'
                  }`}
                >
                  Save Current Week Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vaultSnapshots.map((snap) => (
                  <motion.div
                    key={snap._id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-2xl space-y-4 border transition-all ${
                      isDark ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>
                        {snap.week_label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isDark ? 'bg-[#1A3827] text-emerald-400 border-emerald-500/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                      }`}>
                        Eco Score: {snap.eco_score}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                        {snap.total_species} Species • {snap.total_observations} Observations
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                        Active Days: {snap.active_days}/7 • Peak: {snap.most_active_day}
                      </p>
                    </div>

                    {snap.summary && (
                      <p className={`text-xs line-clamp-2 italic ${isDark ? 'text-slate-300' : 'text-[#0F2418]'}`}>
                        "{snap.summary}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-black/10">
                      <button
                        onClick={() => handleViewSavedSnapshot(snap)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.viewSnapshot}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSnapshot(snap._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Delete Snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ──────────────── EXPORT CENTER MODAL ──────────────── */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border shadow-2xl relative my-8 ${
                isDark ? 'bg-[#0E2015] border-[#4ADE80] text-white' : 'bg-[#FAF7F0] border-[#183B28] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                    <Download className="w-6 h-6 text-emerald-400" />
                    NaturePulse Export Center
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                    Export and share your weekly recap data across 6 production-ready formats.
                  </p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-full hover:bg-black/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'txt', label: 'Plain Text (.txt)', icon: FileText, desc: 'Structured summary for notes' },
                  { id: 'pdf', label: 'Document PDF (.pdf)', icon: FileCode, desc: 'Full graphical PDF report' },
                  { id: 'png', label: 'Image Card (.png)', icon: ImageIcon, desc: 'High-res infographic visual' },
                  { id: 'json', label: 'JSON Dataset (.json)', icon: FileCode, desc: 'Raw machine-readable data' },
                  { id: 'csv', label: 'Species CSV (.csv)', icon: Table, desc: 'Tabular spreadsheet catalog' },
                  { id: 'share', label: 'Share & QR Link', icon: QrCode, desc: 'Mobile share sheet & QR Code' },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSel = exportFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => { setExportFormat(fmt.id); setExportSuccess(false); }}
                      className={`p-3.5 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${
                        isSel
                          ? isDark ? 'bg-[#1A3827] border-[#4ADE80] shadow-md shadow-[#4ADE80]/20' : 'bg-[#E1EFE0] border-[#183B28] shadow-md'
                          : isDark ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/40' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSel ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`} />
                      <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{fmt.label}</p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{fmt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Format Specific Preview / Options */}
              {exportFormat === 'share' && (
                <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                  isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}>
                  <p className="text-xs font-bold">Scan to open recap on mobile or share with fellow naturalists:</p>
                  {qrCodeDataUrl && (
                    <img src={qrCodeDataUrl} alt="Recap QR Code" className="w-36 h-36 mx-auto rounded-xl shadow-md border" />
                  )}
                  <p className="text-[11px] text-emerald-400 font-mono break-all">{window.location.href}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {exportSuccess && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Export successfully generated!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/10 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecuteExport}
                    disabled={isExporting}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                      isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-white hover:bg-[#255239]'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isExporting ? 'Generating…' :
                       exportFormat === 'share' ? (copiedLink ? 'Copied to Clipboard!' : 'Share / Copy Report') :
                       `Export as ${exportFormat.toUpperCase()}`}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── HIDDEN PRINTABLE CARD FOR PNG IMAGE EXPORT ──────────────── */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={printableCardRef}
          style={{ width: '800px', minHeight: '600px' }}
          className={`p-8 rounded-3xl space-y-6 ${
            isDark ? 'bg-[#040B06] text-white' : 'bg-[#FAF7F0] text-[#0F2418]'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">NaturePulse Ecological Cosmos</span>
              <h2 className="font-display text-3xl font-extrabold">Weekly Activity Recap</h2>
              <p className="text-xs text-slate-400">{recapData?.week_label}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">Eco Score</span>
              <h3 className="font-display text-3xl font-extrabold text-emerald-400">{recapData?.eco_score}%</h3>
              <p className="text-[10px] text-emerald-300">{recapData?.eco_rank}</p>
            </div>
          </div>

          {/* Synthesis Quote */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#E1EFE0] border-[#C3DEC0]'}`}>
            <p className="text-xs italic">"{recapData?.summary}"</p>
          </div>

          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#13271C]' : 'bg-white'}`}>
              <span className="text-[10px] font-bold uppercase">Active Days</span>
              <p className="text-xl font-extrabold text-emerald-400">{recapData?.active_days}/7</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#13271C]' : 'bg-white'}`}>
              <span className="text-[10px] font-bold uppercase">Species Logged</span>
              <p className="text-xl font-extrabold text-emerald-400">{recapData?.total_species}</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#13271C]' : 'bg-white'}`}>
              <span className="text-[10px] font-bold uppercase">Observations</span>
              <p className="text-xl font-extrabold text-emerald-400">{recapData?.total_observations}</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#13271C]' : 'bg-white'}`}>
              <span className="text-[10px] font-bold uppercase">Peak Day</span>
              <p className="text-xl font-extrabold text-emerald-400">{recapData?.most_active_day}</p>
            </div>
          </div>

          {/* Top Species List */}
          {recapData?.species_list && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider">Top Species Observed</span>
              <div className="grid grid-cols-3 gap-2">
                {recapData.species_list.slice(0, 6).map((sp, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-xs ${isDark ? 'bg-[#13271C]' : 'bg-white'}`}>
                    <p className="font-bold truncate">{sp.name}</p>
                    <p className="text-[10px] text-emerald-400">{sp.category} • {sp.highest_confidence}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2 text-[10px] text-slate-400 border-t">
            NaturePulse • Biodiversity & Ecological Intelligence • naturepulse.org
          </div>
        </div>
      </div>

    </div>
  );
}
