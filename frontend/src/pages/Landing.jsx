import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, Compass, BookOpen, HandHeart, RotateCcw, Sparkles, ChevronDown } from 'lucide-react';
import { PulseOrb } from '../components/ui';
import ThemeToggle from '../components/ThemeToggle';
import MeasuredHero from '../components/MeasuredHero';
import HorizontalReviewsTicker from '../components/HorizontalReviewsTicker';
import ScrollTypographyHighlight from '../components/ScrollTypographyHighlight';
import AnimatedStatCard from '../components/AnimatedStatCard';
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
      className="group relative [perspective:1200px] h-[290px] w-full select-none"
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
          opacity: { duration: 0.5, delay: i * 0.05 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-3xl cursor-pointer shadow-soft hover:shadow-[0_20px_50px_-10px_rgba(151,205,171,0.35)] gpu-layer"
      >
        {/* FRONT FACE (0°) */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#15281D] p-7 border border-white/10 group-hover:border-[#97CDAB]/50 transition-colors flex flex-col justify-between overflow-hidden gpu-layer"
        >
          {/* Top Glowing Beam */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#97CDAB] via-[#E6C176] to-[#97CDAB] rounded-t-3xl opacity-80" />
          
          {/* Ambient Glow Aura */}
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#97CDAB]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="relative z-10 flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#97CDAB]/15 border border-[#97CDAB]/20 flex items-center justify-center text-[#97CDAB] group-hover:scale-110 transition-transform">
                <step.icon size={20} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] font-mono font-bold text-[#97CDAB]/70 group-hover:text-[#E6C176] transition-colors">
                0{i + 1}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-2xl text-white font-semibold group-hover:text-[#97CDAB] transition-colors">{step.title}</h3>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{step.body}</p>
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#97CDAB] font-semibold uppercase tracking-wider">
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
          className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#1C3727] via-[#14281C] to-[#0E1E15] p-7 border-2 border-[#97CDAB] shadow-2xl flex flex-col justify-between overflow-hidden gpu-layer"
        >
          {/* Glowing Back Accent */}
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-[#E6C176]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full bg-[#97CDAB]/25 text-[#97CDAB] border border-[#97CDAB]/40">
                {PRACTICE_TIPS[i].label}
              </span>
              <span className="text-xs font-mono text-[#E6C176] font-bold">0{i + 1} / 06</span>
            </div>

            <h4 className="font-display text-xl text-white font-semibold mt-1">
              {step.title} Practice
            </h4>

            <p className="mt-2.5 text-sm text-white/95 leading-relaxed font-normal">
              "{PRACTICE_TIPS[i].tip}"
            </p>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#E6C176] font-semibold uppercase tracking-wider">
            <span>Active Field Protocol</span>
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
          ? 'bg-[#162E20] border-[#97CDAB]/60 shadow-[0_16px_36px_rgba(151,205,171,0.2)] -translate-y-1'
          : 'bg-[#14281C] border-white/10 hover:border-[#97CDAB]/40'
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none group">
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-mono font-bold text-[#E6C176]">0{index + 1}</span>
          <h3 className={`font-display text-lg sm:text-xl font-semibold transition-colors ${isOpen ? 'text-[#97CDAB]' : 'text-white group-hover:text-[#97CDAB]'}`}>
            {faq.q}
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'bg-[#97CDAB] text-[#060E09] rotate-180 scale-110' : 'bg-white/10 text-[#97CDAB]'
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
              <div className="pt-4 pl-4 border-l-2 border-[#97CDAB] bg-white/[0.02] rounded-r-xl">
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

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (user || isDemoUser) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1610] text-white">
      {/* ────────────────────── 1. MEASURED CURSOR-FOLLOWING SPOTLIGHT VIDEO HERO ────────────────────── */}
      <section id="hero">
        <MeasuredHero />
      </section>

      {/* ────────────────────── 2. HORIZONTAL REVIEWS TICKER ────────────────────── */}
      <section id="reviews">
        <HorizontalReviewsTicker />
      </section>

      {/* ────────────────────── 3. SCROLL TYPOGRAPHY HIGHLIGHT ────────────────────── */}
      <section>
        <ScrollTypographyHighlight />
      </section>

      {/* ────────────────────── 4. THE JOURNEY LOOP (TAGDA 3D HOVER FLIP CARDS) ────────────────────── */}
      <section id="journey" className="py-20 border-t border-white/10 bg-[#0E1E15]">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] font-semibold">The loop</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 max-w-2xl text-white font-semibold">A relationship, not a streak.</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOURNEY.map((step, i) => (
              <JourneyHoverCard key={step.title} step={step} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 5. MEET PULSE AI ────────────────────── */}
      <section id="pulse" className="py-20 bg-[#162D20] text-white transition-colors">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] font-semibold">Meet Pulse</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2 text-white font-semibold">Calm. Encouraging. Intelligent. Practical.</h2>
            <p className="mt-5 text-white/80 leading-relaxed">
              Pulse is your field companion. It writes daily missions from your city, your time, and what you have already noticed.
              It reads a photograph only as far as the image supports. When it does not know, it says so.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>— Personalized missions that require real-world interaction</li>
              <li>— Nature Lens with structured, cautious image understanding</li>
              <li>— Ecological stories that connect several observations without forcing a plot</li>
            </ul>
          </div>
          <div className="rounded-[28px] bg-black/40 border border-white/15 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <PulseOrb size={44} />
              <div>
                <p className="font-display text-xl text-white font-semibold">Pulse</p>
                <p className="text-xs text-white/60">Your nature guide</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-white/90">I have twelve minutes before a meeting. What should I actually do?</div>
              <div className="rounded-2xl bg-white text-[#0A1610] font-medium px-4 py-3 shadow-md">
                Twelve minutes is enough. Walk to the nearest street tree you can name by location, not by species. Stand still. Count textures on the bark. Then come back and tell me one thing that surprised you.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── 6. TRUST & ETHICS PILLARS ────────────────────── */}
      <section id="trust" className="py-20 bg-[#0E1E15]">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6">
          {[
            ['No invented names', 'If Pulse is unsure, the observation stays unnamed. Honesty is part of ecological literacy.'],
            ['No exact locations', 'We store city and habitat, never a pin on your house. Community posts are equally coarse.'],
            ['Care, not performance', 'Actions are modest and local. We do not overclaim impact or sell a carbon fairy tale.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-3xl border border-white/10 p-6 bg-[#15281D] shadow-soft">
              <h3 className="font-display text-2xl text-white font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────── 7. PRODUCT PREVIEW ────────────────────── */}
      <section className="py-24 bg-[#122419]">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] font-semibold">Dashboard</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 mb-12 text-white font-semibold">Your ecological home base.</h2>
          <div className="relative rounded-[32px] overflow-hidden shadow-lift border border-white/15 max-w-5xl mx-auto">
            <img src="/landing_preview.jpg" alt="NaturePulse Dashboard Preview" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ────────────────────── 8. KEY FEATURES ────────────────────── */}
      <section className="py-24 bg-[#0E1E15]">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] text-center font-semibold">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-center mb-16 text-white font-semibold">Everything you need to connect.</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Compass, title: 'Habitat Mapping', desc: 'Discover nearby green spaces based on ecology, not just street addresses.' },
              { icon: HandHeart, title: 'Local Actions', desc: 'Practical, meaningful tasks tailored to the time you have right now.' },
              { icon: BookOpen, title: 'Field Notes', desc: 'Keep a private journal of your observations with AI-assisted insights.' },
              { icon: Sparkles, title: 'Ecological Stories', desc: 'Watch your daily observations weave into a continuous narrative.' }
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-3xl bg-[#15281D] border border-white/10 hover:border-[#97CDAB]/40 transition-colors shadow-sm group">
                <div className="w-12 h-12 rounded-2xl bg-[#97CDAB]/20 text-[#97CDAB] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <f.icon size={20} />
                </div>
                <h3 className="font-display text-xl text-white font-semibold">{f.title}</h3>
                <p className="mt-3 text-sm text-white/75 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 9. STATISTICS ────────────────────── */}
      <section className="py-20 bg-[#14291B] text-white">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '12k+', label: 'Active Observers' },
            { val: '450+', label: 'Cities Mapped' },
            { val: '80k', label: 'Field Notes' },
            { val: '100%', label: 'Privacy Focused' },
          ].map((s) => (
            <AnimatedStatCard key={s.label} value={s.val} label={s.label} />
          ))}
        </div>
      </section>

      {/* ────────────────────── 10. BENEFITS ────────────────────── */}
      <section className="py-24 bg-[#0E1E15]">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-soft">
            <img src="/login_nature.jpg" alt="Nature path" className="w-full h-[500px] object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] font-semibold">Why Choose Us</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2 mb-6 text-white font-semibold">Designed for actual reality.</h2>
            <div className="space-y-6">
              {[
                { title: 'Screen time that leads outside', desc: 'Unlike endless feeds, our app is designed to be closed. We give you a mission and send you out.' },
                { title: 'Zero guilt, zero gamification', desc: 'No streaks to lose, no leaderboards to climb. Just a quiet space to record your relationship with nature.' },
                { title: 'Scientific yet accessible', desc: 'We bridge the gap between rigorous ecology and everyday walking, making nature understandable.' }
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#97CDAB]/20 flex flex-shrink-0 items-center justify-center mt-1 text-[#97CDAB]">
                    <ArrowRight size={12} />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-white font-semibold">{b.title}</h4>
                    <p className="mt-2 text-sm text-white/75">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── 11. TESTIMONIALS (INTERACTIVE LETTER & CARD HIGHLIGHT) ────────────────────── */}
      <section className="py-24 bg-[#122419] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] text-center font-semibold mb-2">
            COMMUNITY TESTIMONIALS
          </p>

          {/* Slightly Bolder Heading with 3D Letter Flip on Hover */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-center mb-16 text-white font-bold flex justify-center flex-wrap gap-x-3 sm:gap-x-4 select-none [perspective:800px]">
            {"Stories from the field.".split(" ").map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap">
                {word.split("").map((char, cIdx) => (
                  <motion.span
                    key={cIdx}
                    whileHover={{ rotateY: 360, y: -8, scale: 1.25, color: '#97CDAB' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformStyle: 'preserve-3d', display: 'inline-block' }}
                    className="inline-block transition-colors cursor-pointer gpu-layer font-bold"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "It completely changed how I walk to work. I notice the moss on the brick walls now.", name: "Sarah L.", loc: "Urban Ecologist", role: "Verified Observer" },
              { text: "The missions are perfectly sized. 10 minutes is actually 10 minutes. It respects my time.", name: "Marcus T.", loc: "Software Engineer", role: "Habitat Explorer" },
              { text: "I love that it doesn't force me to pretend I know the exact Latin name of every bird.", name: "Elena R.", loc: "Amateur Birdwatcher", role: "Field Journaler" }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -14, scale: 1.04 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-[#172D20] to-[#112318] border border-white/10 hover:border-[#E6C176]/70 shadow-soft hover:shadow-[0_24px_60px_-12px_rgba(230,193,118,0.3)] transition-all cursor-pointer overflow-hidden gpu-layer"
              >
                {/* 1. Diagonal Holographic Shimmer Light Beam Sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                {/* 2. Top Glowing Gold/Sage Dual Accent Line */}
                <div className="absolute top-0 left-0 w-0 group-hover:w-full h-1 bg-gradient-to-r from-[#E6C176] via-[#97CDAB] to-[#E6C176] transition-all duration-500 rounded-t-3xl" />
                
                {/* 3. Ambient Gold Glow Aura */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#E6C176]/10 rounded-full blur-3xl group-hover:bg-[#E6C176]/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                {/* Star Rating & Role Badge */}
                <div className="relative z-10 flex items-center justify-between mb-5">
                  <div className="flex gap-1.5 text-[#E6C176] group-hover:scale-110 transition-transform origin-left">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className="text-base group-hover:drop-shadow-[0_0_8px_rgba(230,193,118,0.8)] transition-all">★</span>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold px-3 py-1 rounded-full bg-[#E6C176]/15 text-[#E6C176] border border-[#E6C176]/30 group-hover:border-[#E6C176]/60 transition-colors">
                    {t.role}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="relative z-10 text-white/90 italic mb-7 leading-relaxed text-base font-normal group-hover:text-white transition-colors">
                  "{t.text}"
                </p>

                {/* Card Bottom Profile Meta */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-white text-lg group-hover:text-[#E6C176] transition-colors">{t.name}</p>
                    <p className="text-xs text-white/60 mt-0.5">{t.loc}</p>
                  </div>

                  {/* 360° Rotating Sparkle Badge */}
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#E6C176] group-hover:bg-[#E6C176] group-hover:text-[#060E09] group-hover:rotate-[360deg] transition-all duration-700 shadow-md">
                    <Sparkles size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 12. FAQ / COMMON INQUIRIES ────────────────────── */}
      <section className="py-24 bg-[#0E1E15]">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6C176] text-center font-semibold mb-2">Questions</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-center mb-12 text-white font-semibold">Common inquiries.</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FaqAccordionItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 13. FINAL CTA ────────────────────── */}
      <section className="py-24 px-5 bg-[#0E1E15]">
        <div className="max-w-4xl mx-auto rounded-[40px] bg-gradient-to-br from-[#1C3727] to-[#14281C] text-white p-12 sm:p-20 text-center relative overflow-hidden border border-white/15 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6C176]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#97CDAB]/15 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-6xl mb-6 font-semibold text-white">Ready to return?</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-10 text-lg">
              Join thousands of others building a quieter, more honest relationship with the living world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto rounded-full bg-[#97CDAB] text-[#0A1610] px-8 py-4 font-semibold hover:bg-white transition-colors">
                Create free account
              </Link>
              <Link to="/login" className="w-full sm:w-auto rounded-full border border-white/30 text-white px-8 py-4 font-semibold hover:bg-white/10 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── 14. 3D INTERACTIVE ECOSYSTEM FOOTER ────────────────────── */}
      <Interactive3DFooter />
    </div>
  );
}
