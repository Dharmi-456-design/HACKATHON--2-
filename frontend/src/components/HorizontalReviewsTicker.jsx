import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Star, ShieldCheck, Quote, ChevronRight } from 'lucide-react';
import ReviewsModal from './ReviewsModal';

const REVIEWS = [
  {
    id: 1,
    name: 'Jimmy Slagle',
    handle: '@jimmyslagle',
    role: 'Verified Nature Explorer',
    quote: 'In 14 days, NaturePulse helped me observe 42 native flora species in my urban walk. My nature connection score grew by 38%.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    stat: '42 Observations logged',
    yOffset: '-y-4',
  },
  {
    id: 2,
    name: 'Ty Zamkow',
    handle: '@tyzamkow',
    role: 'Verified Nature Explorer',
    quote: 'The quiet discipline of observing species daily replaced mindless scrolling. This platform turns ordinary walks into sanctuaries.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    stat: '14-Day Streak Completed',
    yOffset: 'translate-y-6',
  },
  {
    id: 3,
    name: 'Nathan Graville',
    handle: '@nathangraville',
    role: 'Verified Nature Explorer',
    quote: 'Pulse AI field insights connected birdsong, soil temperature, and tree bark textures into a single living notebook.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    stat: '5D Score: 94/100',
    yOffset: '-translate-y-3',
  },
  {
    id: 4,
    name: 'Arianna Armelli',
    handle: '@arianna_a',
    role: 'Verified Nature Explorer',
    quote: 'The community biodiversity passport gave our urban design firm baseline telemetry we couldn’t find anywhere else.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    stat: '8 Habitats Mapped',
    yOffset: 'translate-y-8',
  },
  {
    id: 5,
    name: 'Fawaz Buqammaz',
    handle: '@fawaz_b',
    role: 'Verified Nature Explorer',
    quote: 'Acoustic telemetry at 5:30 AM revealed 14 migratory bird calls I never noticed before in my local park.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    stat: '14 Avian Logs',
    yOffset: '-translate-y-6',
  },
  {
    id: 6,
    name: 'Elena Rostova',
    handle: '@elena_rostova',
    role: 'Verified Nature Explorer',
    quote: 'Extremely elegant UI. It makes citizen science feel like a high-end luxury relationship with the living earth.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    stat: 'Community Pioneer',
    yOffset: 'translate-y-4',
  },
  {
    id: 7,
    name: 'Devin Sterling',
    handle: '@devin_sterling',
    role: 'Verified Nature Explorer',
    quote: 'Returning to the same moss seam every rain cycle has given me a deep sense of calm and biological grounding.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    stat: '28 Field Visits',
    yOffset: '-translate-y-8',
  },
  {
    id: 8,
    name: 'Marcus Vance',
    handle: '@marcus_vance',
    role: 'Verified Nature Explorer',
    quote: 'The soil micro-habitats tracking tool is unmatched. Every urban naturalist needs NaturePulse.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    stat: 'Micro-Habitat Badge',
    yOffset: 'translate-y-5',
  },
  {
    id: 9,
    name: 'Maya Lin-Chao',
    handle: '@mayalinchao',
    role: 'Verified Nature Explorer',
    quote: 'NaturePulse turns raw field observations into stunning ecological stories with zero clutter.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    stat: 'Field Journalist',
    yOffset: '-translate-y-4',
  },
  {
    id: 10,
    name: 'Sophia Chen',
    handle: '@sophiachen',
    role: 'Verified Nature Explorer',
    quote: 'Tracking urban tree canopy health across 4 neighborhood zones was effortless and inspiring.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    stat: 'Canopy Specialist',
    yOffset: 'translate-y-7',
  },
];

const NUM_TICKS = 120;

export default function HorizontalReviewsTicker() {
  const containerRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    setScrollPos(latest);
  });

  // Transform scroll progress to horizontal translation percentage
  const x = useTransform(smoothProgress, [0, 1], ['0%', '-68%']);

  return (
    <>
      <div ref={containerRef} className="relative h-[360vh] bg-[#0E1E15] text-white">
        {/* Sticky Viewport Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-10 px-6 sm:px-12 select-none">
          
          {/* Header Bar */}
          <div className="max-w-7xl w-full mx-auto flex items-end justify-between z-20 pt-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck size={14} /> VERIFIED COMMUNITY IMPACT
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Loved by 12,000+ urban explorers
              </h2>
            </div>

            {/* Read All Reviews Button (Opens Modal) */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#96CD7B] text-white hover:text-[#0A1610] text-sm font-semibold border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-[1.03]"
            >
              Read all reviews <ChevronRight size={16} />
            </button>
          </div>

          {/* Liquid Gaussian Equalizer Progress Scrubber Bar */}
          <div className="relative max-w-7xl w-full mx-auto my-6 z-20">
            <div className="flex items-center justify-between gap-1 h-12 px-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              {Array.from({ length: NUM_TICKS }).map((_, i) => {
                const tickProgress = i / (NUM_TICKS - 1);
                const distance = Math.abs(tickProgress - scrollPos);
                
                // Continuous Gaussian Wave Peak (dynamic even when static)
                const wave = Math.exp(-Math.pow(distance / 0.08, 2));
                const heightPx = Math.max(6, Math.round(wave * 34 + 6));
                const opacity = 0.25 + wave * 0.75;
                const isPeak = wave > 0.85;

                return (
                  <div
                    key={i}
                    style={{
                      height: `${heightPx}px`,
                      opacity,
                    }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPeak
                        ? 'bg-[#96CD7B] shadow-[0_0_12px_#96CD7B]'
                        : 'bg-white/40'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Scrubber Label */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50 px-3 mt-1.5 uppercase tracking-widest">
              <span>01 / Start</span>
              <span className="text-[#96CD7B]">Scroll to read stories</span>
              <span>10 / End</span>
            </div>
          </div>

          {/* Horizontal Staircase Ticker Cards */}
          <div className="relative w-full overflow-visible z-10 my-auto">
            <motion.div style={{ x }} className="flex gap-6 sm:gap-8 items-center pl-4 pr-32">
              {REVIEWS.map((r) => {
                const isHovered = hoveredId === r.id;
                const isAnyHovered = hoveredId !== null;
                const isBlur = isAnyHovered && !isHovered;

                return (
                  <motion.div
                    key={r.id}
                    onMouseEnter={() => setHoveredId(r.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      filter: isBlur ? 'blur(3px)' : 'blur(0px)',
                      opacity: isBlur ? 0.35 : 1,
                      scale: isHovered ? 1.05 : 1,
                    }}
                    className={`w-[320px] sm:w-[380px] shrink-0 bg-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 ${r.yOffset} hover:border-[#96CD7B]/60 hover:bg-white/10`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] border border-[#96CD7B]/30">
                        {r.stat}
                      </span>
                    </div>

                    {/* Quote */}
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light italic mb-6">
                      "{r.quote}"
                    </p>

                    {/* Author Footer */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{r.name}</h4>
                        <p className="text-xs text-white/60">{r.handle} · <span className="text-[#96CD7B]">{r.role}</span></p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Hint */}
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-white/40 z-20 pb-2">
            <span>Hover card to inspect explorer profile</span>
            <span>10 Verified Community Reports</span>
          </div>

        </div>
      </div>

      {/* Reviews Modal */}
      <ReviewsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
