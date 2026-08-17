import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { ShieldCheck, ChevronRight, ThumbsUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';
import { toTestimonial, DEFAULT_TESTIMONIALS } from '../lib/testimonials';
import { usePublicStats } from '../hooks/usePublicStats';
import ReviewsModal from './ReviewsModal';

const OFFSETS = [
  '-translate-y-3 sm:-translate-y-4',
  'translate-y-3 sm:translate-y-4',
  '-translate-y-2 sm:-translate-y-3',
  'translate-y-3 sm:translate-y-4',
  '-translate-y-4 sm:-translate-y-5',
  'translate-y-2 sm:translate-y-3',
  '-translate-y-3 sm:-translate-y-4',
  'translate-y-4 sm:translate-y-5',
  '-translate-y-2 sm:-translate-y-3',
  'translate-y-3 sm:translate-y-4',
];

const NUM_TICKS = 120;

export default function HorizontalReviewsTicker() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);
  const [reports, setReports] = useState(DEFAULT_TESTIMONIALS);
  const [loadError, setLoadError] = useState(false);
  const stats = usePublicStats();

  // Load real community field reports and ensure a rich 10-card exploration
  useEffect(() => {
    apiFetch('/api/testimonials', {}, null)
      .then((list) => {
        if (Array.isArray(list) && list.length) {
          const mapped = list.map(toTestimonial);
          if (mapped.length < 10) {
            const extra = DEFAULT_TESTIMONIALS.slice(mapped.length);
            setReports([...mapped, ...extra]);
          } else {
            setReports(mapped);
          }
        }
      })
      .catch(() => setLoadError(false));
  }, []);

  // Calculate dynamic horizontal distance based on actual track width vs viewport width
  const updateScrollDistance = () => {
    if (trackRef.current) {
      const scrollWidth = trackRef.current.scrollWidth;
      const clientWidth = window.innerWidth;
      const extraPadding = 140;
      const distance = Math.max(0, scrollWidth - clientWidth + extraPadding);
      setMaxScrollDistance(distance);
    }
  };

  useLayoutEffect(() => {
    updateScrollDistance();
    const handleResize = () => updateScrollDistance();
    window.addEventListener('resize', handleResize);

    // Observe track container resize (e.g. fonts loading, dynamic items)
    let ro;
    if (trackRef.current && typeof window.ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        requestAnimationFrame(updateScrollDistance);
      });
      ro.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [reports]);

  // Framer Motion useScroll hook bound to targetRef
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Fast-reacting physics spring for fluid, non-lagging animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    mass: 0.15,
    restDelta: 0.0002,
  });

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    // Reaches 1.0 (completed) at 85% of vertical scroll, ensuring last card is fully reached and held
    setScrollPos(Math.min(1, Math.max(0, latest / 0.85)));
  });

  // Dynamic transform: reaches last card by 85% of scroll, then stays resting in place before unpinning
  const x = useTransform(smoothProgress, (val) => {
    const progress = Math.min(1, Math.max(0, val / 0.85));
    return -progress * maxScrollDistance;
  });

  const { isDark } = useTheme();
  const userCount = stats && typeof stats.users === 'number' ? stats.users.toLocaleString() : null;

  return (
    <>
      {/* Outer Section - Explicit 350vh height guaranteeing extensive pinned scroll runway for all 10 cards */}
      <div
        ref={targetRef}
        style={{ height: '350vh' }}
        className={`relative transition-colors duration-300 ${isDark ? 'bg-[#0E1E15] text-white' : 'bg-[#F4F7F4] text-slate-900'}`}
      >
        
        {/* Sticky Viewport Container - Pins section while user completes the horizontal travel */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-5 sm:py-7 px-4 sm:px-8 lg:px-12 select-none">
          
          {/* Header Bar */}
          <div className="max-w-7xl w-full mx-auto flex items-end justify-between z-20 pt-2 shrink-0">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2 ${
                isDark ? 'bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B]' : 'bg-emerald-800/15 border border-emerald-800/30 text-emerald-800'
              }`}>
                <ShieldCheck size={14} /> REAL COMMUNITY FIELD REPORTS
              </div>
              <h2 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {userCount ? `Loved by ${userCount} urban explorers` : 'Loved by urban explorers'}
              </h2>
            </div>

            {/* Read All Reports Button */}
            <button
              onClick={() => setModalOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer shadow-lg hover:scale-[1.03] shrink-0 ${
                isDark ? 'bg-white/10 hover:bg-[#96CD7B] text-white hover:text-[#0A1610] border-white/20' : 'bg-slate-900/10 hover:bg-[#1C3727] text-slate-900 hover:text-white border-slate-900/20'
              }`}
            >
              Read all field reports <ChevronRight size={16} />
            </button>
          </div>

          {/* Linear Wave Scrubber Bar (Dynamic Green Peak following scroll progress) */}
          <div className="relative max-w-7xl w-full mx-auto my-2 sm:my-3 z-20 shrink-0">
            <div className={`flex items-center justify-between gap-1 h-12 px-3 rounded-2xl backdrop-blur-md border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-900/5 border-slate-900/10'
            }`}>
              {Array.from({ length: NUM_TICKS }).map((_, i) => {
                const tickProgress = i / (NUM_TICKS - 1);
                const distance = Math.abs(tickProgress - scrollPos);
                
                // Continuous Smooth Gaussian Wave Peak
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
                    className={`w-1 rounded-full transition-all duration-100 ${
                      isWaveActive
                        ? isDark ? 'bg-[#96CD7B] shadow-[0_0_10px_#96CD7B]' : 'bg-emerald-700 shadow-[0_0_10px_rgba(4,120,87,0.5)]'
                        : isDark ? 'bg-white/35' : 'bg-slate-900/25'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Scrubber Label */}
            <div className={`flex items-center justify-between text-[11px] font-mono px-3 mt-1.5 uppercase tracking-widest ${
              isDark ? 'text-white/50' : 'text-slate-600'
            }`}>
              <span>01 / START</span>
              <span className={isDark ? 'text-[#96CD7B]' : 'text-emerald-700 font-bold'}>
                {scrollPos >= 0.98 ? '✓ ALL REPORTS COMPLETED' : `SCROLL TO EXPLORE (${reports.length} CARDS)`}
              </span>
              <span>{String(reports.length).padStart(2, '0')} / END</span>
            </div>
          </div>

          {/* Horizontal Staircase Ticker Cards (Cards scroll START to END with ample vertical headroom) */}
          <div className="relative w-full flex-1 min-h-0 flex items-center overflow-visible z-10 py-4 sm:py-6 my-auto">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-6 sm:gap-8 items-center pl-4 sm:pl-8 pr-16 sm:pr-24 w-max py-4"
            >
              {reports.length === 0 ? (
                <motion.div
                  className="w-[320px] sm:w-[360px] h-[270px] shrink-0 bg-[#E8E6E1] text-[#1A1A1A] rounded-2xl p-6 shadow-2xl flex flex-col justify-center items-center text-center border border-black/10"
                >
                  <span className="text-4xl mb-4">🌿</span>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {loadError ? 'Could not load reports' : 'No field reports yet'}
                  </h3>
                  <p className="text-sm text-black/60 max-w-[240px] leading-relaxed">
                    {loadError
                      ? 'Check your connection and try again.'
                      : 'Share your first species observation from the Community feed and it will appear here.'}
                  </p>
                </motion.div>
              ) : (
                reports.map((r, i) => {
                  const isHovered = hoveredId === r.id;
                  const isAnyHovered = hoveredId !== null;
                  const isBlur = isAnyHovered && !isHovered;

                  return (
                    <motion.div
                      key={r.id}
                      onMouseEnter={() => setHoveredId(r.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        filter: isBlur ? 'blur(2px)' : 'blur(0px)',
                        opacity: isBlur ? 0.65 : 1,
                        scale: isHovered ? 1.04 : 1,
                      }}
                      className={`w-[320px] sm:w-[360px] h-[270px] shrink-0 bg-[#162C20] text-white rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 ${OFFSETS[i % OFFSETS.length]} ${
                        isHovered ? 'bg-[#1D3A2A] shadow-[0_20px_50px_rgba(150,205,123,0.3)] border-2 border-[#96CD7B]' : 'border border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-3.5 pb-3.5 border-b border-white/10">
                          {r.avatar ? (
                            <img
                              src={r.avatar}
                              alt={r.species || r.name}
                              loading="lazy"
                              decoding="async"
                              width="44"
                              height="44"
                              className="w-11 h-11 rounded-full object-cover border border-white/20 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#96CD7B]/20 border border-[#96CD7B]/40 flex items-center justify-center text-xl text-[#96CD7B]">
                              🌿
                            </div>
                          )}
                          <div className="flex flex-col">
                            <h3 className="text-base font-bold text-white font-sans leading-tight">{r.name}</h3>
                            <p className="text-xs text-[#96CD7B] font-medium">{r.role}</p>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal line-clamp-4">
                          "{r.quote}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-1 text-[#E6C176] text-xs font-mono font-semibold">
                          <ThumbsUp size={13} aria-hidden="true" />
                          {r.upvotes} upvote{r.upvotes === 1 ? '' : 's'}
                        </div>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] border border-[#96CD7B]/30">
                          {r.species || r.tag}
                        </span>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>

          {/* Bottom Hint */}
          <div className={`max-w-7xl w-full mx-auto flex items-center justify-between text-xs z-20 pb-2 shrink-0 ${
            isDark ? 'text-white/40' : 'text-slate-500'
          }`}>
            <span>Scroll down to explore all {reports.length} cards from start to end</span>
            <span>{reports.length} Verified Explorer Reports</span>
          </div>

        </div>
      </div>

      {/* Reviews Modal */}
      <ReviewsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} reports={reports} />
    </>
  );
}
