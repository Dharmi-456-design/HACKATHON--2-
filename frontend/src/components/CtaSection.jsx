import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ThumbsUp, MapPin } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toTestimonial, DEFAULT_TESTIMONIALS } from '../lib/testimonials';
import { usePublicStats } from '../hooks/usePublicStats';
import { useAuth } from '../contexts/AuthContext';

function FadeUp({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Live preview panel: newest real community field report + real aggregate stats
function LivePreviewPanel() {
  const [report, setReport] = useState(() => DEFAULT_TESTIMONIALS[0]);
  const stats = usePublicStats();

  useEffect(() => {
    apiFetch('/api/testimonials', {}, null)
      .then((list) => {
        if (Array.isArray(list) && list.length) {
          setReport(toTestimonial(list[0]));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="liquid-glass w-full max-w-[1100px] rounded-2xl mx-auto overflow-hidden p-2 sm:p-3 shadow-2xl">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(220px,320px)_1fr] gap-2 sm:gap-3">
        {/* Live stats column */}
        <div className="min-h-0 hidden sm:flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#08080A]/60 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#96CD7B]/15 flex items-center justify-center text-[#96CD7B]">
              <Leaf size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">NaturePulse</span>
              <span className="text-[11px] text-white/40 leading-tight">Live community data</span>
            </div>
          </div>

          {[
            { label: 'Species observations', value: stats && typeof stats.observations === 'number' ? stats.observations.toLocaleString() : '—' },
            { label: 'Community field reports', value: stats && typeof stats.reports === 'number' ? stats.reports.toLocaleString() : '—' },
            { label: 'Urban explorers', value: stats && typeof stats.users === 'number' ? stats.users.toLocaleString() : '—' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/50">{row.label}</span>
              <span className="text-sm font-semibold text-white font-mono">{row.value}</span>
            </div>
          ))}

          <div className="text-[10px] text-white/35 leading-relaxed">
            Counts update live from the NaturePulse database.
          </div>
        </div>

        {/* Latest real field report */}
        <div className="min-h-0 rounded-2xl border border-white/10 bg-[#0E1E15]/80 backdrop-blur-xl p-4 flex flex-col justify-between">
          {report ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#96CD7B]/20 text-[#96CD7B]">
                    {report.species || 'Field Report'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#96CD7B] text-xs font-mono">
                    <ThumbsUp size={13} /> {report.upvotes}
                  </div>
                </div>
                <p className="text-sm text-white/85 leading-relaxed italic line-clamp-4">
                  "{report.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 mt-3 border-t border-white/10">
                {report.avatar ? (
                  <img src={report.avatar} alt={report.species} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 flex items-center justify-center">🌿</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">{report.name}</span>
                  <span className="text-[11px] text-white/50 flex items-center gap-1 truncate">
                    <MapPin size={10} /> {report.city}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 flex-1">
              <span className="text-3xl mb-3">🌿</span>
              <h3 className="text-sm font-semibold text-white mb-1">No field reports yet</h3>
              <p className="text-[11px] text-white/50 max-w-[220px]">
                Share the first observation from the Community feed and it will show here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main CtaSection Component
export default function CtaSection() {
  const { user } = useAuth();
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const dashboardY = useTransform(scrollYProgress, [0, 1], ['120px', '-120px']);
  const grassY = useTransform(scrollYProgress, [0, 1], isMobile ? ['80px', '-40px'] : ['200px', '-200px']);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full overflow-hidden bg-black text-white font-sans"
      style={{ background: 'linear-gradient(to bottom, transparent 0%, #14191E 100%)' }}
    >
      <div className="relative mx-auto max-w-[1080px] px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 pb-[440px] sm:pb-[520px] md:pb-[440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="relative z-20 max-w-[400px]">
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                <Leaf size={14} /> REAL OBSERVATIONS, STORED FOR YOU
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.05] text-white font-sans">
                Reconnect with the living world outside.
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-white/80 text-base sm:text-lg leading-[1.5] max-w-[380px] font-light">
                Identify species with the Nature Lens, complete daily field missions, and build your Biodiversity Passport — every observation is real and yours to keep.
              </p>
            </FadeUp>
            <FadeUp delay={0.3} className="mt-10">
              <Link
                to={user ? "/app" : "/register"}
                className="inline-flex items-center gap-2 rounded-full bg-[#96CD7B] px-6 py-3 text-sm font-semibold text-[#0A1610] transition-all hover:scale-[1.03] hover:bg-[#A8DD90] shadow-lg cursor-pointer"
              >
                {user ? "Go to Dashboard →" : "Start for free"}
              </Link>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Live dashboard preview pinned to right edge, parallax Y */}
      <motion.div
        style={{ y: dashboardY }}
        className="absolute top-[440px] sm:top-[460px] md:top-[500px] lg:top-20 left-4 right-4 sm:left-auto sm:-right-[8%] md:-right-[10%] lg:-right-[12%] z-10 sm:w-[85%] md:w-[80%] lg:w-[68%]"
      >
        <LivePreviewPanel />
      </motion.div>

      {/* Bottom ambient backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#060E09] to-transparent z-30"
      />
    </section>
  );
}
