import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react';

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
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);

  // Calculate dynamic horizontal distance based on actual track width vs viewport width
  const updateScrollDistance = () => {
    if (trackRef.current) {
      const scrollWidth = trackRef.current.scrollWidth;
      const clientWidth = window.innerWidth;
      const extraPadding = 80;
      const distance = Math.max(0, scrollWidth - clientWidth + extraPadding);
      setMaxScrollDistance(distance);
    }
  };

  useLayoutEffect(() => {
    updateScrollDistance();
    window.addEventListener('resize', updateScrollDistance);
    return () => window.removeEventListener('resize', updateScrollDistance);
  }, []);

  // Framer Motion useScroll hook bound to targetRef
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Smooth physics spring easing for zero jitter/flicker
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001,
  });

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    setScrollPos(latest);
  });

  // Map scroll progress (0 to 1) so cards visually travel from RIGHT to LEFT, viewport moves LEFT to RIGHT
  const x = useTransform(smoothProgress, [0, 1], [0, -maxScrollDistance]);

  // Initial Card Entrance: Cards start slightly below and move UPWARD into position as section enters viewport
  const cardsY = useTransform(smoothProgress, [0, 0.05], [35, 0]);
  const cardsOpacity = useTransform(smoothProgress, [0, 0.05], [0.3, 1]);

  return (
    <>
      {/* Outer Section - Pinning duration tuned to 250vh for faster scroll distance */}
      <div ref={targetRef} className="relative h-[250vh] bg-[#0E1E15] text-white">
        
        {/* Sticky Viewport Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-10 px-6 sm:px-12 select-none">
          
          <div className="max-w-[1400px] w-full mx-auto relative z-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
                Beyond clients.<br />Trusted partners.
              </h2>
              
              {/* Scrubber Area (Right side) */}
              <div className="mt-8 md:mt-0 flex flex-col items-end">
                <div className="flex items-center gap-1 h-8 px-2">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const tickProgress = i / (40 - 1);
                    const distance = Math.abs(tickProgress - scrollPos);
                    const wave = Math.exp(-Math.pow(distance / 0.15, 2));
                    const heightPx = Math.max(4, Math.round(wave * 20 + 4));
                    const opacity = 0.2 + wave * 0.8;
                    const isWaveActive = wave > 0.5;

                    return (
                      <div
                        key={i}
                        style={{ height: `${heightPx}px`, opacity }}
                        className={`w-[2px] rounded-full transition-all duration-100 ${
                          isWaveActive ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-white/30'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Horizontal Staircase Ticker Cards */}
            <motion.div
              style={{ y: cardsY, opacity: cardsOpacity }}
              className="relative w-full overflow-hidden z-10 py-8"
            >
              <motion.div
                ref={trackRef}
                style={{ x }}
                className="flex gap-6 sm:gap-8 items-center pr-12 w-max"
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
                        opacity: isBlur ? 0.4 : 1,
                        scale: isHovered ? 1.02 : 1,
                      }}
                      className={`w-[320px] sm:w-[380px] h-[300px] shrink-0 bg-[#DCD8D2] border border-[#C5BFAF] text-[#1E2521] rounded-sm p-8 shadow-xl flex flex-col justify-between transition-all duration-300 ${r.yOffset} ${
                        isHovered ? 'shadow-2xl border-[#A8A08D] bg-[#E3E0DB]' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={r.avatar}
                              alt={r.name}
                              className="w-12 h-12 rounded-full object-cover border border-[#1E2521]/10 shadow-sm"
                            />
                            <div className="flex flex-col">
                              <h4 className="text-base font-bold text-[#1E2521] font-sans leading-tight">{r.name}</h4>
                              <p className="text-xs text-[#1E2521]/60 font-medium">{r.handle}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-[15px] text-[#1E2521]/90 leading-relaxed font-normal">
                          "{r.quote}"
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
