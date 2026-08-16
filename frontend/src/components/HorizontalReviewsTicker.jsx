import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react';
import ReviewsModal from './ReviewsModal';

const REVIEWS = [
  {
    id: 1,
    name: 'Dallas Ty',
    handle: '@dallasty',
    role: 'Verified Nature Observer',
    quote: 'Great experience observing together. The team was attentive at every stage and brought strong telemetry, turning our observations into real impact.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    stat: '42 Observations',
    yOffset: '-translate-y-6',
  },
  {
    id: 2,
    name: 'Alex Marshall',
    handle: '@alexmarshall',
    role: 'Verified Nature Explorer',
    quote: 'Proactive and sweet approach to our observations. They captured our vision connecting everyday green spaces into impactful brand stories.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    stat: '14-Day Streak',
    yOffset: 'translate-y-8',
  },
  {
    id: 3,
    name: 'Favio D\'Agostino',
    handle: '@faviodagostino',
    role: 'Acoustic Researcher',
    quote: 'Honestly, we were given a lot better than we expected. Fast performance, precise field logging, and great attention to detail.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    stat: '5D Score: 94/100',
    yOffset: '-translate-y-4',
  },
  {
    id: 4,
    name: 'Arianna Armelli',
    handle: '@arianna_a',
    role: 'Urban Habitat Lead',
    quote: 'Alex has been amazing. Only a month in but NaturePulse has impact in our community already on local species, UX, and habitat care.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    stat: '8 Habitats Mapped',
    yOffset: 'translate-y-10',
  },
  {
    id: 5,
    name: 'Fawaz Buqammaz',
    handle: '@fawaz_b',
    role: 'Avian Telemetry Lead',
    quote: 'Acoustic telemetry at 5:30 AM revealed 14 migratory bird calls I never noticed before in my local park. Standard-setting design.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    stat: '14 Avian Logs',
    yOffset: '-translate-y-8',
  },
  {
    id: 6,
    name: 'Elena Rostova',
    handle: '@elena_rostova',
    role: 'Community Pioneer',
    quote: 'Extremely elegant UI. It makes citizen science feel like a high-end luxury relationship with the living earth.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    stat: 'Verified Explorer',
    yOffset: 'translate-y-6',
  },
  {
    id: 7,
    name: 'Devin Sterling',
    handle: '@devin_sterling',
    role: 'Field Journaler',
    quote: 'Returning to the same moss seam every rain cycle has given me a deep sense of calm and biological grounding.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    stat: '28 Field Visits',
    yOffset: '-translate-y-10',
  },
  {
    id: 8,
    name: 'Marcus Vance',
    handle: '@marcus_vance',
    role: 'Micro-Habitat Analyst',
    quote: 'The soil micro-habitats tracking tool is unmatched. Every urban naturalist needs NaturePulse.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80',
    stat: 'Micro-Habitat Badge',
    yOffset: 'translate-y-8',
  },
  {
    id: 9,
    name: 'Maya Lin-Chao',
    handle: '@mayalinchao',
    role: 'Environmental Reporter',
    quote: 'NaturePulse turns raw field observations into stunning ecological stories with zero clutter.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    stat: 'Field Journalist',
    yOffset: '-translate-y-6',
  },
  {
    id: 10,
    name: 'Sophia Chen',
    handle: '@sophiachen',
    role: 'Canopy Specialist',
    quote: 'Tracking urban tree canopy health across 4 neighborhood zones was effortless and inspiring.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    stat: 'Canopy Specialist',
    yOffset: 'translate-y-9',
  },
];

const NUM_TICKS = 120;

export default function HorizontalReviewsTicker() {
  const wrapperRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger smooth 1-second auto-scroll when component enters viewport or on mouse hover
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger smooth 1-second left-to-right scroll
          setProgress(1);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    // Fast & smooth 1-second scroll transition on hover
    setProgress((prev) => (prev >= 0.9 ? 0 : 1));
  };

  const translateX = -progress * 72;

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        className="relative bg-[#0E1E15] text-white overflow-hidden py-8 select-none"
      >
        <div className="w-full flex flex-col justify-between py-4 px-6 sm:px-12 space-y-6">
          
          {/* Header Bar */}
          <div className="max-w-7xl w-full mx-auto flex items-end justify-between z-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck size={14} /> VERIFIED COMMUNITY IMPACT
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Loved by 12,000+ urban explorers
              </h2>
            </div>

            {/* Read All Reviews Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#96CD7B] text-white hover:text-[#0A1610] text-sm font-semibold border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-[1.03]"
            >
              Read all reviews <ChevronRight size={16} />
            </button>
          </div>

          {/* Linear Group of Mini Lines (Wave Scrubber Bar) */}
          <div className="relative max-w-7xl w-full mx-auto z-20">
            <div className="flex items-center justify-between gap-1 h-12 px-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              {Array.from({ length: NUM_TICKS }).map((_, i) => {
                const tickProgress = i / (NUM_TICKS - 1);
                const distance = Math.abs(tickProgress - progress);
                
                const wave = Math.exp(-Math.pow(distance / 0.065, 2));
                const heightPx = Math.max(8, Math.round(wave * 32 + 8));
                const opacity = 0.3 + wave * 0.7;
                const isWaveActive = wave > 0.5;

                return (
                  <div
                    key={i}
                    style={{
                      height: `${heightPx}px`,
                      opacity,
                    }}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isWaveActive
                        ? 'bg-[#96CD7B] shadow-[0_0_10px_#96CD7B]'
                        : 'bg-white/35'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Scrubber Label */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50 px-3 mt-1.5 uppercase tracking-widest">
              <span>01 / START</span>
              <span className="text-[#96CD7B]">AUTOMATIC 1-SEC SMOOTH SCROLL</span>
              <span>10 / END</span>
            </div>
          </div>

          {/* Horizontal Staircase Ticker Cards (1-Second Ultra-Smooth Framer Motion Transition) */}
          <div className="relative w-full overflow-hidden z-10 py-4">
            <motion.div
              animate={{ x: `${translateX}%` }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              className="flex gap-6 sm:gap-8 items-center pl-4 pr-32"
            >
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
                      opacity: isBlur ? 0.22 : 1,
                      scale: isHovered ? 1.05 : 1,
                    }}
                    className={`w-[320px] sm:w-[360px] h-[280px] shrink-0 bg-[#E8E6E1] text-[#1A1A1A] rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 ${r.yOffset} ${
                      isHovered ? 'bg-[#FAF9F6] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-[#96CD7B]' : 'border border-black/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-black/10">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-11 h-11 rounded-full object-cover border border-black/20 shadow-sm"
                        />
                        <div className="flex flex-col">
                          <h4 className="text-base font-bold text-black font-sans leading-tight">{r.name}</h4>
                          <p className="text-xs text-black/60 font-medium">{r.role}</p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#2A2A2A] leading-relaxed font-normal">
                        "{r.quote}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-black/10">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 text-black/80">
                        {r.stat}
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Hint */}
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-white/40 z-20">
            <span>Automatic smooth 1-second card translation</span>
            <span>10 Verified Explorer Reports</span>
          </div>

        </div>
      </div>

      {/* Reviews Modal */}
      <ReviewsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
