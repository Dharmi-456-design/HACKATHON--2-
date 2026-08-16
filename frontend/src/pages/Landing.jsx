import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, Compass, BookOpen, HandHeart, RotateCcw, Sparkles, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { PulseOrb } from '../components/ui';
import SplashIntro from '../components/SplashIntro';
import Navbar from '../components/Navbar';
import LithosHero from '../components/LithosHero';
import HorizontalReviewsTicker from '../components/HorizontalReviewsTicker';
import ScrollTypographyHighlight from '../components/ScrollTypographyHighlight';
import AnimatedStatCard from '../components/AnimatedStatCard';
import PricingSection from '../components/PricingSection';
import CtaSection from '../components/CtaSection';
import Interactive3DFooter from '../components/Interactive3DFooter';
import { useAuth } from '../contexts/AuthContext';

const JOURNEY = [
  { icon: Eye, title: 'Observe', body: 'Notice what is already beside you — bark, birdsong, a wet seam of moss.' },
  { icon: BookOpen, title: 'Understand', body: 'Ask why it matters without inventing a name you do not have.' },
  { icon: Compass, title: 'Experience', body: 'Step into a place. Sit. Listen. Return at a different hour.' },
  { icon: HandHeart, title: 'Act', body: 'Do one modest, legal, local thing that keeps a relationship honest.' },
  { icon: Sparkles, title: 'Measure', body: 'Watch your Nature Connection across Observe, Explore, Learn, Act, Return.' },
  { icon: RotateCcw, title: 'Return', body: 'A single visit is a snapshot. Returning is how a landscape becomes familiar.' },
];

const PRACTICE_TIPS = [
  { label: 'Field Protocol', tip: 'Look for subtle details: bark textures, moss seams, avian calls. Spend 2 minutes taking notes without forcing a name.' },
  { label: 'Ecological Insight', tip: 'Ask why this species thrives in this specific habitat before trying to memorize Latin taxonomy.' },
  { label: 'Sensory Engagement', tip: 'Step into the same spot at a different hour — dusk, dawn, or after rain. Notice light and sound shifts.' },
  { label: 'Local Stewardship', tip: 'Perform one modest local action: water native soil, clear plastic debris, or record habitat telemetry.' },
  { label: 'Connection Metric', tip: 'Track your 5-dimensional Nature Connection score across time, habitats, and seasonal returns.' },
  { label: 'Long-term Care', tip: 'A single visit is a snapshot. Repeated quiet visits turn unfamiliar landscapes into living sanctuaries.' },
];

const PHILOSOPHY_PHOTOS = [
  {
    title: 'Urban Canopy Moss',
    location: 'Pacific Northwest Forest',
    img: 'https://images.unsplash.com/photo-1682018673550-c70a28c9c447?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Dawn Avian Haven',
    location: 'Coastal Wetland Seam',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Fungal Network Soil',
    location: 'Alpine Woodland Ridge',
    img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Native Habitat Telemetry',
    location: 'Urban Oasis Park',
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
  },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes. Core observation tools, daily field missions, and species tracking are 100% free forever for all urban observers.", tag: "Free Forever" },
  { q: "Do you track my exact location?", a: "No. We only store city-level and broad habitat telemetry. We never store precise GPS pins of your home or private walks.", tag: "Privacy First" },
  { q: "Do I need to know about plants?", a: "Not at all. NaturePulse is designed specifically for beginners. You only need curiosity to notice things around you.", tag: "Beginner Friendly" },
  { q: "Is there a mobile app?", a: "Yes! NaturePulse is a Progressive Web App (PWA). You can install it directly to your iOS or Android home screen with zero app store clutter.", tag: "PWA Supported" }
];

function JourneyHoverCard({ step, i }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative [perspective:1200px] h-[300px] w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        animate={{
          rotateY: isHovered ? 180 : 0,
          scale: isHovered ? 1.03 : 1,
          y: isHovered ? -6 : 0,
        }}
        transition={{
          rotateY: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
          scale: { duration: 0.4, ease: 'easeOut' },
          y: { duration: 0.4, ease: 'easeOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full cursor-pointer"
      >
        {/* FRONT FACE */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#162C20] border border-white/10 p-7 shadow-xl flex flex-col justify-between overflow-hidden group-hover:border-[#96CD7B]/50 transition-colors gpu-layer"
        >
          {/* Top Glowing Beam */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#96CD7B] via-[#E6C176] to-[#96CD7B] rounded-t-3xl opacity-80" />
          
          {/* Ambient Glow Aura */}
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#96CD7B]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="relative z-10 flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#96CD7B]/15 border border-[#96CD7B]/20 flex items-center justify-center text-[#96CD7B] group-hover:scale-110 transition-transform">
                <step.icon size={20} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] font-mono font-bold text-[#96CD7B]/70 group-hover:text-[#E6C176] transition-colors">
                0{i + 1}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-2xl text-white font-semibold group-hover:text-[#96CD7B] transition-colors">{step.title}</h3>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{step.body}</p>
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#96CD7B] font-semibold uppercase tracking-wider">
            <span>Hover to reveal field practice</span>
            <RotateCcw size={13} className="group-hover:rotate-180 transition-transform duration-700" />
          </div>
        </div>

        {/* BACK FACE (180° FLIPPED REVEAL) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
          }}
          className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#1C3727] via-[#14281C] to-[#0E1E15] p-7 border-2 border-[#96CD7B] shadow-2xl flex flex-col justify-between overflow-hidden gpu-layer"
        >
          {/* Glowing Back Accent */}
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-[#E6C176]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full bg-[#96CD7B]/25 text-[#96CD7B] border border-[#96CD7B]/40">
                {PRACTICE_TIPS[i].label}
              </span>
              <span className="text-xs font-mono text-[#E6C176] font-bold">0{i + 1} / 06</span>
            </div>

            <h4 className="font-display text-xl text-white font-semibold mt-1">
              {step.title} Practice
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-white/90 leading-relaxed font-light">
              {PRACTICE_TIPS[i].tip}
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E6C176] font-semibold uppercase tracking-wider">
            <span>Field protocol active</span>
            <Sparkles size={13} className="text-[#E6C176] animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FaqAccordionItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden gpu-layer ${
        isOpen
          ? 'bg-[#162E20] border-[#96CD7B]/60 shadow-[0_16px_36px_rgba(150,205,123,0.2)] -translate-y-1'
          : 'bg-[#14281C] border-white/10 hover:border-[#96CD7B]/40'
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none group">
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-mono font-bold text-[#E6C176]">0{index + 1}</span>
          <h3 className={`font-display text-lg sm:text-xl font-semibold transition-colors ${isOpen ? 'text-[#96CD7B]' : 'text-white group-hover:text-[#96CD7B]'}`}>
            {faq.q}
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'bg-[#96CD7B] text-[#0A1610] rotate-180 scale-110' : 'bg-white/10 text-[#96CD7B]'
            }`}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-white/10 mt-1">
              <div className="pt-4 pl-4 border-l-2 border-[#96CD7B] bg-white/[0.02] rounded-r-xl">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                  {faq.a}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const { user, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const [pulsePrompt, setPulsePrompt] = useState(
    'I have 10 minutes near a park stream. What should I observe right now?'
  );
  const [pulseReply, setPulseReply] = useState(
    '10 minutes is ideal. Stand on the stream bank without stepping in. Count three textures of wet moss on stones, listen for dawn songbirds, and log one note in your field book.'
  );

  const handlePulsePrompt = (prompt, reply) => {
    setPulsePrompt(prompt);
    setPulseReply(reply);
  };

  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1610] text-white overflow-clip">
      {/* ────────────────────── 0. INITIAL SPLASH INTRO ANIMATION ────────────────────── */}
      <SplashIntro onComplete={() => setSplashDone(true)} />

      {/* ────────────────────── REDESIGNED NAVBAR ────────────────────── */}
      <Navbar />

      {/* ────────────────────── 1. LITHOS CURSOR-FOLLOWING SPOTLIGHT HERO ────────────────────── */}
      <section id="hero">
        <LithosHero />
      </section>

      {/* ────────────────────── 2. HORIZONTAL REVIEWS TICKER ────────────────────── */}
      <section id="reviews">
        <HorizontalReviewsTicker />
      </section>

      {/* ────────────────────── 3. SCROLL TYPOGRAPHY HIGHLIGHT ────────────────────── */}
      <section>
        <ScrollTypographyHighlight />
      </section>

      {/* ────────────────────── 4. THE PHILOSOPHY SECTION (ENHANCED TEXT & 4-PHOTO GRID) ────────────────────── */}
      <section className="py-10 bg-[#0E1E15] text-white select-none">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-widest">
              <Sparkles size={14} /> ECOLOGICAL FOUNDATION
            </div>

            {/* Increased prominent size for "The Philosophy" */}
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              The Philosophy
            </h2>

            <p className="text-base sm:text-xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
              Nature connection is not about memorizing Latin names or building a streak. It is a quiet, continuous conversation with the living world right outside your doorstep.
            </p>
          </div>

          {/* 4-Photo Nature Observations Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHILOSOPHY_PHOTOS.map((photo, idx) => (
              <motion.div
                key={photo.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl h-80 bg-black/40 cursor-pointer"
              >
                <img
                  src={photo.img}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1610] via-[#0A1610]/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] border border-[#96CD7B]/30 mb-2 inline-block">
                    0{idx + 1} Field Sample
                  </span>
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#96CD7B] transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-1">{photo.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 5. THE LOOP (REBUILT 3D FLIP CARDS) ────────────────────── */}
      <section id="journey" className="py-24 border-t border-white/10 bg-[#0E1E15] select-none">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#E6C176] font-semibold">The Nature Loop</p>
            <h2 className="font-display text-4xl sm:text-6xl font-bold mt-2 text-white">
              A living relationship, not a gamified streak.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/75 font-light leading-relaxed">
              Hover over each phase to unlock practical field protocol tips crafted for urban observers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {JOURNEY.map((step, i) => (
              <JourneyHoverCard key={step.title} step={step} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 6. MEET PULSE AI (REWRITTEN & INTERACTIVE DEMO) ────────────────────── */}
      <section id="pulse" className="py-24 bg-[#14281C] text-white border-t border-white/10 select-none">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-widest">
              <PulseOrb size={16} /> MEET PULSE AI ASSISTANT
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Calm. Intelligent. Built for the field.
            </h2>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed font-light">
              Pulse AI is your intelligent ecological companion. It crafts personalized daily field tasks based on your city, local weather, and what you’ve already logged. It reads photographs cautiously — when it isn’t sure, it admits it instead of guessing.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-white/85 font-light">
                <div className="w-5 h-5 rounded-full bg-[#96CD7B]/20 flex items-center justify-center text-[#96CD7B] shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <span>Tailored field missions designed for 10-minute urban breaks</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-white/85 font-light">
                <div className="w-5 h-5 rounded-full bg-[#96CD7B]/20 flex items-center justify-center text-[#96CD7B] shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <span>Cautious species vision telemetry — zero hallucinated Latin names</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-white/85 font-light">
                <div className="w-5 h-5 rounded-full bg-[#96CD7B]/20 flex items-center justify-center text-[#96CD7B] shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <span>5-dimensional nature connection telemetry tracking</span>
              </div>
            </div>

            {/* Quick Sample Triggers */}
            <div className="pt-4 space-y-2">
              <p className="text-xs font-mono text-[#E6C176] uppercase tracking-wider font-semibold">Try sample questions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handlePulsePrompt(
                      'What birds call at 6:00 AM near urban oak trees?',
                      'In North American urban canopies, dawn calls around 6 AM are typically Robin territorial chirps, American Goldfinch notes, and Black-capped Chickadee calls.'
                    )
                  }
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#96CD7B] text-white hover:text-[#0A1610] text-xs font-medium transition-colors cursor-pointer"
                >
                  Dawn Avian Calls
                </button>
                <button
                  onClick={() =>
                    handlePulsePrompt(
                      'How do I identify moss seams on brick walls?',
                      'Look for green cushions along damp mortar joints. True mosses have small leaf-like structures, while lichens form flat, crusty patches.'
                    )
                  }
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#96CD7B] text-white hover:text-[#0A1610] text-xs font-medium transition-colors cursor-pointer"
                >
                  Moss Seams
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Chat Box */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#08080A]/80 border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <PulseOrb size={38} />
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Pulse AI Companion</h3>
                  <p className="text-xs text-[#96CD7B] font-mono">Status: Connected & Field Ready</p>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                {/* User Bubble */}
                <div className="ml-auto max-w-[90%] rounded-2xl bg-white/15 p-4 text-xs sm:text-sm text-white/90 text-right leading-relaxed font-light">
                  {pulsePrompt}
                </div>

                {/* AI Assistant Bubble */}
                <div className="max-w-[90%] rounded-2xl bg-[#1C3727] border border-[#96CD7B]/30 p-4 text-xs sm:text-sm text-white leading-relaxed font-normal shadow-md">
                  <div className="flex items-center gap-2 mb-2 text-[#96CD7B] text-xs font-mono font-semibold">
                    <Sparkles size={13} /> Pulse Intelligence
                  </div>
                  {pulseReply}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span>Interactive Live Preview</span>
                <span className="text-[#96CD7B]">Powered by Gemini AI</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────── 7. DASHBOARD PREVIEW SECTION ────────────────────── */}
      <section className="py-24 bg-[#0E1E15] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-widest">
            <ShieldCheck size={14} /> ECOLOGICAL HOME BASE
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Your NaturePulse Control Center
          </h2>

          <p className="text-base sm:text-xl text-white/80 font-light max-w-3xl mx-auto leading-relaxed">
            Track your 5-dimensional nature connection score, log daily species discoveries, monitor local habitat telemetry, and share verified observations with a thriving community.
          </p>

          {/* Rich Dashboard Screenshot Frame */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 max-w-5xl mx-auto mt-10 group">
            <img
              src="/landing_preview.jpg"
              alt="NaturePulse Dashboard Preview"
              className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1610] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ────────────────────── 8. STATISTICS ────────────────────── */}
      <section className="py-20 bg-[#14281C] text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '12k+', label: 'Active Observers' },
            { val: '450+', label: 'Cities Mapped' },
            { val: '80k', label: 'Field Notes Logged' },
            { val: '100%', label: 'Privacy Focused' },
          ].map((s) => (
            <AnimatedStatCard key={s.label} value={s.val} label={s.label} />
          ))}
        </div>
      </section>

      {/* ────────────────────── 9. WHY CHOOSE US (HIGH-RES NATURE PHOTO) ────────────────────── */}
      <section className="py-24 bg-[#0E1E15] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative group h-[480px]">
            <img
              src="/login_nature.jpg"
              alt="Calm Nature Observation Path"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1610]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <span className="text-xs font-mono text-[#96CD7B] uppercase tracking-wider font-semibold">
                Calm & Grounded Reality
              </span>
              <p className="text-sm text-white/80 mt-1 font-light">
                Designed to guide your eyes away from glowing screens and into living green spaces.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#E6C176] font-semibold">Why Choose Us</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
              Designed for actual reality.
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Screen time that leads outside', desc: 'Unlike endless social feeds, NaturePulse gives you a 10-minute field mission and sends you out to observe.' },
                { title: 'Zero guilt, zero gamification', desc: 'No penalizing streaks to lose, no stress. Just a quiet space to record your evolving relationship with nature.' },
                { title: 'Scientific yet accessible', desc: 'We bridge rigorous ecological science with everyday walks, making nature understandable for everyone.' }
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#96CD7B]/20 flex flex-shrink-0 items-center justify-center mt-1 text-[#96CD7B]">
                    <ArrowRight size={14} />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-white font-semibold">{b.title}</h4>
                    <p className="mt-1.5 text-sm text-white/75 leading-relaxed font-light">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── 11. HACKATHON PRICING SECTION ────────────────────── */}
      <PricingSection />

      {/* ────────────────────── 12. FAQ / COMMON INQUIRIES ────────────────────── */}
      <section className="py-24 bg-[#0E1E15] text-white border-t border-white/10">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#E6C176] text-center font-semibold mb-2">Questions</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-center mb-12 text-white font-semibold">Common inquiries.</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FaqAccordionItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 13. FINAL CTA SECTION WITH VELORAH VIDEO MOCK ────────────────────── */}
      <CtaSection />

      {/* ────────────────────── 14. 3D INTERACTIVE ECOSYSTEM FOOTER ────────────────────── */}
      <Interactive3DFooter />
    </div>
  );
}
