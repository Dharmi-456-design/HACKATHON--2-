import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { ShieldCheck, ChevronRight, ThumbsUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';
import { toTestimonial } from '../lib/testimonials';
import { usePublicStats } from '../hooks/usePublicStats';
import ReviewsModal from './ReviewsModal';

const OFFSETS = [
  '-translate-y-6',
  'translate-y-8',
  '-translate-y-4',
  'translate-y-10',
  '-translate-y-8',
  'translate-y-6',
  '-translate-y-10',
  'translate-y-8',
  '-translate-y-6',
  'translate-y-9',
];

const NUM_TICKS = 120;

export default function HorizontalReviewsTicker() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);
  const [reports, setReports] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const stats = usePublicStats();

  // Load the real community field reports that power the ticker
  useEffect(() => {
    apiFetch('/api/testimonials', {}, null)
      .then((list) => setReports(Array.isArray(list) ? list.map(toTestimonial) : []))
      .catch(() => setLoadError(true));
  }, []);

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

  // Recompute travel distance once real reports arrive
  useEffect(() => {
    updateScrollDistance();
  }, [reports.length]);

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

  // Map scroll progress (0 to 1) so cards visually travel from LEFT to RIGHT (-maxScrollDistance to 0)
  const x = useTransform(smoothProgress, [0, 1], [-maxScrollDistance, 0]);

  // Initial Card Entrance: Cards start slightly below and move UPWARD into position as section enters viewport
  const cardsY = useTransform(smoothProgress, [0, 0.15], [35, 0]);
  const cardsOpacity = useTransform(smoothProgress, [0, 0.1], [0.3, 1]);

  const { isDark } = useTheme();
  const userCount = stats && typeof stats.users === 'number' ? stats.users.toLocaleString() : null;

  return (
    <>
      {/* Outer Section - Pinning duration tuned to 120vh to guarantee zero empty space between sections */}
      <div ref={targetRef} className={`relative h-[120vh] transition-colors duration-300 ${isDark ? 'bg-[#0E1E15] text-white' : 'bg-[#F4F7F4] text-slate-900'}`}>
        
        {/* Sticky Viewport Container - Pins section while user completes the horizontal travel */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 px-6 sm:px-12 select-none">
          
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
          <div className="relative max-w-7xl w-full mx-auto my-2 sm:my-4 z-20 shrink-0">
            <div className="flex items-center justify-between gap-1 h-12 px-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
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
              <span className="text-[#96CD7B]">
                {reports.length === 0
                  ? 'NO REPORTS YET'
                  : scrollPos >= 0.98
                    ? `✓ ALL ${reports.length} CARDS COMPLETED`
                    : `SCROLL LEFT → RIGHT (${reports.length} CARDS)`}
              </span>
              <span>{Math.max(10, reports.length)} / END</span>
            </div>
          </div>

          {/* Horizontal Staircase Ticker Cards (Cards Enter UPWARD -> Move LEFT to RIGHT -> Focus Hover Blur) */}
          <motion.div
            style={{ y: cardsY, opacity: cardsOpacity }}
            className="relative w-full overflow-hidden z-10 my-auto py-2"
          >
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-6 sm:gap-8 items-center pl-4 sm:pl-8 pr-16 w-max"
            >
              {reports.length === 0 ? (
                <motion.div
                  className="w-[320px] sm:w-[360px] h-[280px] shrink-0 bg-[#E8E6E1] text-[#1A1A1A] rounded-2xl p-6 shadow-2xl flex flex-col justify-center items-center text-center border border-black/10"
                >
                  <span className="text-4xl mb-4">🌿</span>
                  <h4 className="font-display text-lg font-semibold mb-2">
                    {loadError ? 'Could not load reports' : 'No field reports yet'}
                  </h4>
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
                        filter: isBlur ? 'blur(3px)' : 'blur(0px)',
                        opacity: isBlur ? 0.22 : 1,
                        scale: isHovered ? 1.05 : 1,
                      }}
                      className={`w-[320px] sm:w-[360px] h-[280px] shrink-0 bg-[#E8E6E1] text-[#1A1A1A] rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 ${OFFSETS[i % OFFSETS.length]} ${
                        isHovered ? 'bg-[#FAF9F6] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-[#96CD7B]' : 'border border-black/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-black/10">
                          {r.avatar ? (
                            <img
                              src={r.avatar}
                              alt={r.species || r.name}
                              className="w-11 h-11 rounded-full object-cover border border-black/20 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#96CD7B]/20 border border-[#96CD7B]/40 flex items-center justify-center text-xl">
                              🌿
                            </div>
                          )}
                          <div className="flex flex-col">
                            <h4 className="text-base font-bold text-black font-sans leading-tight">{r.name}</h4>
                            <p className="text-xs text-black/60 font-medium">{r.role}</p>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#2A2A2A] leading-relaxed font-normal line-clamp-4">
                          "{r.quote}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/10">
                        <div className="flex items-center gap-1 text-[#355E45] text-xs font-mono font-semibold">
                          <ThumbsUp size={13} />
                          {r.upvotes} upvote{r.upvotes === 1 ? '' : 's'}
                        </div>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 text-black/80">
                          {r.species || r.tag}
                        </span>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </motion.div>

          {/* Bottom Hint */}
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-white/40 z-20 pb-2 shrink-0">
            <span>Scroll vertically to complete all cards horizontally (LEFT → RIGHT)</span>
            <span>{reports.length} Real Community Field Reports</span>
          </div>

        </div>
      </div>

      {/* Reviews Modal */}
      <ReviewsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} reports={reports} />
    </>
  );
}
