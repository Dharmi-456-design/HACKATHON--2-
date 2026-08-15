import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Card, PrimaryButton, GhostButton, Skeleton, Empty } from '../components/ui';
import { isDemoMode, demoWeeklyRecap, wrapWithFallback } from '../utils/demoMode';
import ShareCard from '../components/ShareCard';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SLIDE_DURATION = 5000;

export default function WeeklyRecap() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startRef = useRef(null);
  const demoMode = isDemoMode();

  useEffect(() => {
    wrapWithFallback(
      () => apiFetch('/api/weekly-recap', {}, token),
      demoWeeklyRecap
    )
      .then((d) => setRecap(d))
      .catch(() => demoWeeklyRecap().then(setRecap))
      .finally(() => setLoading(false));
  }, [token]);

  const totalSlides = recap?.slides?.length || 0;

  const nextSlide = useCallback(() => {
    setCurrentSlide((p) => (p + 1 < totalSlides ? p + 1 : p));
    setProgress(0);
    startRef.current = null;
  }, [totalSlides]);

  // Auto-advance with progress animation
  useEffect(() => {
    if (!recap || prefersReducedMotion()) return;
    if (currentSlide >= totalSlides - 1) return;

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick);
      } else {
        nextSlide();
      }
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current); };
  }, [currentSlide, recap, nextSlide, totalSlides]);

  const goTo = (i) => { setCurrentSlide(i); setProgress(0); startRef.current = null; };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <Card><Empty title="No recap yet" body="Come back after your first week of exploring." /></Card>
      </div>
    );
  }

  const slide = recap.slides[currentSlide];
  const isLast = currentSlide === totalSlides - 1;

  return (
    <motion.div
      className="max-w-2xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3 }}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Weekly Recap</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-1 mb-6">Your week in nature.</h1>

      {demoMode && (
        <span className="inline-block mb-4 bg-gold/20 text-gold rounded-full text-xs px-3 py-1 border border-gold/20">Demo Mode</span>
      )}

      <Card className="overflow-hidden">
        {/* Progress bar */}
        <div className="flex gap-1 p-3 pb-0">
          {recap.slides.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-cream-deep rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-forest rounded-full"
                style={{ width: i < currentSlide ? '100%' : i === currentSlide ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Slide content */}
        <div className="relative min-h-[320px] cursor-pointer" onClick={() => !isLast && nextSlide()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: prefersReducedMotion() ? 0 : 0.3, ease: 'easeOut' }}
              className="p-8 flex flex-col items-center text-center min-h-[320px] justify-center"
            >
              {/* Stat */}
              <motion.p
                className="font-display text-7xl text-forest leading-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: prefersReducedMotion() ? 0 : 0.4 }}
              >
                {slide.stat}
              </motion.p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold mt-1">{slide.stat_label}</p>
              <p className="font-display text-2xl mt-5">{slide.title}</p>
              <p className="text-sm text-forest/65 mt-3 max-w-sm leading-relaxed">{slide.description}</p>

              {/* Species list on slide 2 */}
              {slide.species_list && (
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {slide.species_list.map((s) => (
                    <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-mist/70 text-forest border border-ink/5">{s}</span>
                  ))}
                </div>
              )}

              {/* Tap hint */}
              {!isLast && (
                <p className="mt-6 text-xs text-forest/35 flex items-center gap-1">
                  Tap to continue <ChevronRight size={11} />
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex flex-col items-center gap-4">
          {/* Dot indicators */}
          <div className="flex gap-2">
            {recap.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === currentSlide ? 'bg-forest w-6' : 'bg-forest/20 w-1.5'}`}
              />
            ))}
          </div>

          {isLast && (
            <GhostButton onClick={() => setShowShare(true)}>
              <Share2 size={14} /> Share your recap
            </GhostButton>
          )}
        </div>
      </Card>

      {/* Stats summary below */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="font-display text-3xl text-forest">{recap.total_species}</p>
          <p className="text-xs text-forest/50 mt-1 uppercase tracking-[0.14em]">Species found</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-display text-3xl text-forest">{recap.total_days}</p>
          <p className="text-xs text-forest/50 mt-1 uppercase tracking-[0.14em]">Days explored</p>
        </Card>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && recap.slides[2]?.top_species && (
          <ShareCard
            discovery={recap.slides[2].top_species}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
