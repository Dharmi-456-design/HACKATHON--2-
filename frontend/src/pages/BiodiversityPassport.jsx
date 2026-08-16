import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, User, Brain, Target, Compass, Plus, Trash2, Edit3, X, 
  HelpCircle, Eye, EyeOff, Search, ZoomIn, ZoomOut, RotateCcw, Check, 
  Globe, Shield, BookOpen, Layers, ArrowRight, Lightbulb, Zap, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Bio Map
const BIOMAP_TRANSLATIONS = {
  en: {
    heroTag: 'INTERACTIVE NEURAL BIO MAP',
    heroTitle: 'Your Living Knowledge Universe',
    heroSubtitle: 'A spatial constellation of your interests, skills, learning topics, and AI conversation context.',
    searchPlaceholder: 'Search map nodes, skills, topics…',
    addNodeBtn: '+ Add Topic',
    filterAll: 'All Categories',
    catInterests: '💡 Interests',
    catSkills: '🎓 Skills',
    catLearning: '📖 Learning',
    catGoals: '🎯 Goals',
    catProjects: '💻 Projects',
    catPreferences: '⚙️ Preferences',
    aiUnderstandTitle: 'What AI Understands About Your Interests',
    aiUnderstandDesc: 'Observed from your recent chat history and field observations.',
    whyIsThisHere: 'Why is this here?',
    memoryControlTitle: 'AI Memory Control',
    allowPersonalization: 'Allowed for AI Personalization',
    exploreTopic: 'Explore Related Chats',
    deleteNode: 'Remove Node',
    createNodeTitle: 'Add Topic to Bio Map',
    nodeNameLabel: 'Topic / Interest Name',
    categoryLabel: 'Category',
    reasonLabel: 'Reason or Note',
    saveNodeBtn: 'Add to Neural Map',
  },
  gu: {
    heroTag: 'ઇન્ટરેક્ટિવ ન્યુરલ બાયો મેપ',
    heroTitle: 'તમારું જીવંત જ્ઞાન બ્રહ્માંડ',
    heroSubtitle: 'તમારા રસ, કૌશલ્યો, શીખવાના વિષયો અને એઆઈ વાતચીતના સંદર્ભનું અવકાશી નક્ષત્ર.',
    searchPlaceholder: 'મેપ નોડ્સ, કૌશલ્યો, વિષયો શોધો…',
    addNodeBtn: '+ વિષય ઉમેરો',
    filterAll: 'બધી કેટેગરીઝ',
    catInterests: '💡 રસ',
    catSkills: '🎓 કૌશલ્ય',
    catLearning: '📖 શિક્ષણ',
    catGoals: '🎯 લક્ષ્યો',
    catProjects: '💻 પ્રોજેક્ટ્સ',
    catPreferences: '⚙️ પસંદગીઓ',
    aiUnderstandTitle: 'એઆઈ તમારા રસ વિશે શું સમજે છે',
    aiUnderstandDesc: 'તમારી તાજેતરની ચેટ હિસ્ટ્રી પરથી અવલોકન કરાયેલ.',
    whyIsThisHere: 'આ અહીં કેમ છે?',
    memoryControlTitle: 'એઆઈ મેમરી નિયંત્રણ',
    allowPersonalization: 'એઆઈ પર્સનલાઇઝેશન માટે મંજૂર',
    exploreTopic: 'સંબંધિત ચેટ્સ શોધો',
    deleteNode: 'નોડ દૂર કરો',
    createNodeTitle: 'બાયો મેપમાં વિષય ઉમેરો',
    nodeNameLabel: 'વિષય / રસનું નામ',
    categoryLabel: 'કેટેગરી',
    reasonLabel: 'કારણ અથવા નોંધ',
    saveNodeBtn: 'મેપમાં ઉમેરો',
  },
  hi: {
    heroTag: 'इंटरैक्टिव न्यूरल बायो मैप',
    heroTitle: 'आपका जीवित ज्ञान ब्रह्मांड',
    heroSubtitle: 'आपकी रुचियों, कौशलों, सीखने के विषयों और एआई बातचीत के संदर्भ का आकाशीय नक्षत्र।',
    searchPlaceholder: 'मैप नोड्स, कौशल, विषय खोजें…',
    addNodeBtn: '+ विषय जोड़ें',
    filterAll: 'सभी श्रेणियां',
    catInterests: '💡 रुचियां',
    catSkills: '🎓 कौशल',
    catLearning: '📖 सीखना',
    catGoals: '🎯 लक्ष्य',
    catProjects: '💻 प्रोजेक्ट्स',
    catPreferences: '⚙️ प्राथमिकताएं',
    aiUnderstandTitle: 'एआई आपकी रुचियों के बारे में क्या समझता है',
    aiUnderstandDesc: 'आपकी हालिया चैट हिस्ट्री से देखा गया।',
    whyIsThisHere: 'यह यहां क्यों है?',
    memoryControlTitle: 'एआई मेमोरी नियंत्रण',
    allowPersonalization: 'एआई वैयक्तिकरण के लिए स्वीकृत',
    exploreTopic: 'संबंधित चैट खोजें',
    deleteNode: 'नोड हटाएं',
    createNodeTitle: 'बायो मैप में विषय जोड़ें',
    nodeNameLabel: 'विषय / रुचि का नाम',
    categoryLabel: 'श्रेणी',
    reasonLabel: 'कारण या नोट',
    saveNodeBtn: 'मैप में जोड़ें',
  },
};

// Seed Neural Nodes
const SEED_NODES = [
  { id: 'node-1', name: 'Photosynthesis', category: 'Interests', size: 54, x: 280, y: 140, chatsCount: 14, origin: 'Generated from chat on Wednesday about tree canopy cooling effect.', isMemoryAllowed: true },
  { id: 'node-2', name: 'Species Identification', category: 'Skills', size: 48, x: 420, y: 100, chatsCount: 9, origin: 'Observed from Nature Lens species uploads.', isMemoryAllowed: true },
  { id: 'node-3', name: 'Micro-climates', category: 'Learning', size: 44, x: 160, y: 220, chatsCount: 6, origin: 'Added during Vadodara micro-climate discussion.', isMemoryAllowed: true },
  { id: 'node-4', name: 'Document 10 Species', category: 'Goals', size: 42, x: 460, y: 260, chatsCount: 8, origin: 'Created during Weekly Goal setting.', isMemoryAllowed: true },
  { id: 'node-5', name: 'Urban Canopy Mapping', category: 'Projects', size: 50, x: 320, y: 340, chatsCount: 11, origin: 'Project thread created in Community field notes.', isMemoryAllowed: true },
  { id: 'node-6', name: 'Gujarati & English Primary', category: 'Preferences', size: 40, x: 180, y: 340, chatsCount: 15, origin: 'Language selection setting.', isMemoryAllowed: true },
  { id: 'node-7', name: 'Bird Migration Times', category: 'Interests', size: 38, x: 500, y: 180, chatsCount: 5, origin: 'Generated from Lake Kingfisher inquiry.', isMemoryAllowed: true },
];

export default function BiodiversityPassport() {
  const { user } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = BIOMAP_TRANSLATIONS[lang] || BIOMAP_TRANSLATIONS.en;

  // Persistent Nodes State
  const [nodes, setNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_biomap_v1');
      return saved ? JSON.parse(saved) : SEED_NODES;
    } catch {
      return SEED_NODES;
    }
  });

  // Filter & Selected Node States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flippedCardId, setFlippedCardId] = useState(null);

  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('Interests');
  const [newNodeReason, setNewNodeReason] = useState('');

  useEffect(() => {
    localStorage.setItem('pulse_biomap_v1', JSON.stringify(nodes));
  }, [nodes]);

  // Add Node Submit
  const handleAddNode = (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const newNode = {
      id: `node-${Date.now()}`,
      name: newNodeName.trim(),
      category: newNodeCategory,
      size: 46,
      x: 250 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      chatsCount: 1,
      origin: newNodeReason.trim() || 'Manually added by user to Bio Map.',
      isMemoryAllowed: true,
    };

    setNodes([...nodes, newNode]);
    setNewNodeName('');
    setNewNodeReason('');
    setShowAddModal(false);
    setSelectedNode(newNode);
  };

  // Delete Node
  const handleDeleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  // Toggle Memory Allowance
  const toggleMemoryAllowed = (nodeId) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, isMemoryAllowed: !n.isMemoryAllowed } : n))
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => ({ ...prev, isMemoryAllowed: !prev.isMemoryAllowed }));
    }
  };

  // Filtered Nodes
  const filteredNodes = nodes.filter((n) => {
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = n.name.toLowerCase().includes(q);
      const matchCat = n.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── WHY IS THIS HERE MODAL ──────────────── */}
      <AnimatePresence>
        {showWhyModal && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowWhyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-3">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#4ADE80]" />
                  <span>{t.whyIsThisHere}</span>
                </h3>
                <button onClick={() => setShowWhyModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                  {selectedNode.category} · {selectedNode.name}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 bg-[#0E2015] border border-[#20422E] p-4 rounded-2xl leading-relaxed italic">
                  "{selectedNode.origin}"
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowWhyModal(false)}
                  className="px-5 py-2 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── ADD NODE MODAL ──────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-3">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#4ADE80]" />
                  <span>{t.createNodeTitle}</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNode} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    {t.nodeNameLabel}
                  </label>
                  <input
                    required
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    placeholder="e.g., Urban Butterfly Habitats"
                    className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value)}
                    className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  >
                    <option value="Interests">💡 Interests</option>
                    <option value="Skills">🎓 Skills</option>
                    <option value="Learning">📖 Learning</option>
                    <option value="Goals">🎯 Goals</option>
                    <option value="Projects">💻 Projects</option>
                    <option value="Preferences">⚙️ Preferences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    {t.reasonLabel}
                  </label>
                  <input
                    value={newNodeReason}
                    onChange={(e) => setNewNodeReason(e.target.value)}
                    placeholder="Why are you adding this topic?"
                    className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] cursor-pointer shadow-lg"
                >
                  {t.saveNodeBtn}
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
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.addNodeBtn}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── SEARCH & FILTER BAR ──────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#12241A] border border-[#234A33] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4ADE80]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              t.filterAll,
              t.catInterests,
              t.catSkills,
              t.catLearning,
              t.catGoals,
              t.catProjects,
              t.catPreferences,
            ].map((catLabel, idx) => {
              const val = idx === 0 ? 'All' : ['Interests', 'Skills', 'Learning', 'Goals', 'Projects', 'Preferences'][idx - 1];
              return (
                <button
                  key={catLabel}
                  onClick={() => setSelectedCategory(val)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === val
                      ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                      : 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────── INTERACTIVE NEURAL MAP SVG CANVAS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[480px]">
          <div
            className="relative w-full h-[460px] transition-transform duration-300 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Connecting Light Beams */}
            <svg viewBox="0 0 700 460" className="absolute inset-0 w-full h-full pointer-events-none">
              {filteredNodes.map((n) => (
                <g key={n.id}>
                  <line
                    x1={350}
                    y1={230}
                    x2={n.x}
                    y2={n.y}
                    stroke={selectedNode?.id === n.id ? '#4ADE80' : '#20422E'}
                    strokeWidth={selectedNode?.id === n.id ? '2.5' : '1.2'}
                    strokeDasharray={selectedNode?.id === n.id ? 'none' : '4'}
                  />
                </g>
              ))}
            </svg>

            {/* Central YOU Node */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#2E6141] via-[#1A3827] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer"
              onClick={() => setSelectedNode(null)}
            >
              <User className="w-6 h-6 text-[#4ADE80]" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">YOU</span>
            </motion.div>

            {/* Floating Neural Nodes */}
            {filteredNodes.map((n) => {
              const isSelected = selectedNode?.id === n.id;
              return (
                <motion.div
                  key={n.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNode(n)}
                  style={{ left: n.x, top: n.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shadow-lg z-20 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-110'
                      : 'bg-[#13271C]/90 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <span className="text-xs font-bold whitespace-nowrap">{n.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ──────────────── SELECTED NODE DETAIL DRAWER ──────────────── */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-start border-b border-[#20452F] pb-3">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                  {selectedNode.category}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">{selectedNode.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWhyModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#13271C] border border-[#20422E] text-xs text-[#4ADE80] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.whyIsThisHere}</span>
                </button>

                <button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                  title="Remove Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              "{selectedNode.origin}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#20422E]">
              {/* Memory Allowance Control Toggle */}
              <button
                onClick={() => toggleMemoryAllowed(selectedNode.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  selectedNode.isMemoryAllowed
                    ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                    : 'bg-[#13271C] border-[#20422E] text-slate-400'
                }`}
              >
                {selectedNode.isMemoryAllowed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{t.allowPersonalization}</span>
              </button>

              <button
                onClick={() => alert(`Exploring chats related to ${selectedNode.name}`)}
                className="px-4 py-1.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.exploreTopic}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
