import { useState, useRef, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

const REVIEWS = [
  { id: 1, name: 'Dallas Ty', handle: '@dallasty', role: 'Verified Nature Observer', quote: 'A breathtaking portal. Observing local green life has never felt so purposeful. The streaks keep me coming back every morning.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', yPx: 0 },
  { id: 2, name: 'Alex Marshall', handle: '@alexmarshall', role: 'Verified Nature Explorer', quote: 'A groundbreaking take on ecological storytelling. I feel both connected and curious — an experience like no other.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', yPx: 60 },
  { id: 3, name: "Favio D'Agostino", handle: '@faviodagostino', role: 'Acoustic Researcher', quote: "It starts with excellent data and delivers an almost meditative accuracy. Hands down one of the most finely tuned apps I've used.", avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', yPx: -40 },
  { id: 4, name: 'Arianna Armelli', handle: '@arianna_a', role: 'Urban Habitat Lead', quote: 'Only a month in and NaturePulse already has real impact in our community on local species, UX, and habitat care.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', yPx: 80 },
  { id: 5, name: 'Fawaz Buqammaz', handle: '@fawaz_b', role: 'Avian Telemetry Lead', quote: 'Acoustic telemetry at 5:30 AM revealed 14 migratory bird calls I never noticed before in my local park. Standard-setting design.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', yPx: -20 },
  { id: 6, name: 'Elena Rostova', handle: '@elena_rostova', role: 'Community Pioneer', quote: 'Extremely elegant UI. It makes citizen science feel like a high-end luxury relationship with the living earth.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', yPx: 50 },
  { id: 7, name: 'Devin Sterling', handle: '@devin_sterling', role: 'Field Journaler', quote: 'Returning to the same moss seam every rain cycle has given me a deep sense of calm and biological grounding.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', yPx: -60 },
  { id: 8, name: 'Sophia Chen', handle: '@sophiachen', role: 'Canopy Specialist', quote: 'Tracking urban tree canopy health across 4 neighborhood zones was effortless and inspiring.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', yPx: 30 },
];

export default function HorizontalReviewsTicker() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);

  const updateScrollDistance = () => {
    if (trackRef.current) {
      const distance = Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 80);
      setMaxScrollDistance(distance);
    }
  };

  useLayoutEffect(() => {
    updateScrollDistance();
    window.addEventListener('resize', updateScrollDistance);
    return () => window.removeEventListener('resize', updateScrollDistance);
  }, []);

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 18, mass: 0.4, restDelta: 0.001 });

  useMotionValueEvent(smoothProgress, 'change', (latest) => setScrollPos(latest));

  const x = useTransform(smoothProgress, [0, 1], [0, -maxScrollDistance]);

  return (
    <div ref={targetRef} className="relative h-[300vh] bg-[#0B1A10]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-end justify-between px-10 sm:px-16 pt-14 pb-6 shrink-0">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight">
            Beyond clients.<br />Trusted partners.
          </h2>

          {/* Mini equalizer scrubber */}
          <div className="flex items-center gap-[3px] h-7 self-end mb-1">
            {Array.from({ length: 36 }).map((_, i) => {
              const tp = i / 35;
              const dist = Math.abs(tp - scrollPos);
              const wave = Math.exp(-Math.pow(dist / 0.12, 2));
              const h = Math.max(3, Math.round(wave * 22 + 3));
              return (
                <div
                  key={i}
                  style={{ height: `${h}px`, opacity: 0.2 + wave * 0.8 }}
                  className={`w-[2px] rounded-full transition-all duration-75 ${wave > 0.4 ? 'bg-white' : 'bg-white/25'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Cards track */}
        <div className="flex-1 flex items-center overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-end gap-5 pl-10 sm:pl-16 pr-24 w-max"
          >
            {REVIEWS.map((r) => {
              const isHovered = hoveredId === r.id;
              const isBlur = hoveredId !== null && !isHovered;
              return (
                <motion.div
                  key={r.id}
                  onMouseEnter={() => setHoveredId(r.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    y: r.yPx,
                    filter: isBlur ? 'blur(4px)' : 'none',
                    opacity: isBlur ? 0.35 : 1,
                    scale: isHovered ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`w-[300px] sm:w-[360px] shrink-0 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-7 flex flex-col gap-6 cursor-default select-none transition-colors duration-300 ${isHovered ? 'border-white/25 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{r.name}</p>
                      <p className="text-xs text-white/45 mt-0.5">{r.role}</p>
                    </div>
                  </div>
                  <p className="text-[17px] sm:text-[19px] text-white/85 leading-[1.55] font-light">"{r.quote}"</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="h-16 shrink-0" />
      </div>
    </div>
  );
}
