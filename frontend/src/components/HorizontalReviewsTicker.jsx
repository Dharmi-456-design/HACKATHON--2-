import { useState, useRef, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const REVIEWS = [
  {
    id: 1,
    name: 'Jimmy Slage',
    role: 'Parker AI',
    quote: `Alexandr is an artist. Absolutely brilliant. He's someone who loves the craft of design. His first message to me was "I don't want to do what every other AI company does. I want it to be unique."`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    topOffset: 0,
  },
  {
    id: 2,
    name: 'Ty Zamkow',
    role: 'Nolana AI',
    quote: `Alexandr did an outstanding job on our logo! He's incredibly responsive, fully dedicated, and went above and beyond to ensure we achieved the perfect result.`,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    topOffset: 32,
  },
  {
    id: 3,
    name: 'Nathan Graville',
    role: 'Geviti',
    quote: `Alex has been amazing. Only a month in, but Produx Design very active role in our operation already in terms of web, UI/UX, and eventual marketing.`,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    topOffset: 64,
  },
  {
    id: 4,
    name: 'Delbert Ty',
    role: 'Gather AI',
    quote: `Great experience working together. The team went above expectations at every stage and brought strong thinking, taste, and attention to detail.`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    topOffset: 16,
  },
  {
    id: 5,
    name: 'Arianna Armelli',
    role: 'Dorothy Tech',
    quote: `Produx brand sprint exceeded our expectations. They captured our vision perfectly, delivering a cohesive and impactful brand.`,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    topOffset: 48,
  },
  {
    id: 6,
    name: 'Fawaz Buqammaz',
    role: 'SOOR',
    quote: `Honestly, we were given a better designs than we asked for, produx design is our trusted partner! LETS GROW TOGETHER!`,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    topOffset: 8,
  },
];

// 110 background tick marks for top linear track
const TRACK_TICKS = Array.from({ length: 110 }, (_, i) => i);

// Scrubber node bar heights (wave bump shape)
const SCRUBBER_BARS = [4, 6, 9, 14, 20, 28, 36, 28, 20, 14, 9, 6, 4];

export default function HorizontalReviewsTicker() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const indicatorTrackRef = useRef(null);
  const scrubberRef = useRef(null);

  const [distances, setDistances] = useState({ cards: 0, indicator: 0 });

  useLayoutEffect(() => {
    const calculateDistances = () => {
      if (trackRef.current && indicatorTrackRef.current && scrubberRef.current) {
        // Exact travel needed to align rightmost edge flush with viewport
        const cardsDist = Math.max(0, trackRef.current.scrollWidth - window.innerWidth);
        const indicatorDist = Math.max(0, indicatorTrackRef.current.clientWidth - scrubberRef.current.clientWidth);
        setDistances({ cards: cardsDist, indicator: indicatorDist });
      }
    };

    calculateDistances();
    window.addEventListener('resize', calculateDistances);
    return () => window.removeEventListener('resize', calculateDistances);
  }, []);

  /* ─── Scroll Progress over pinned sticky duration ─── */
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.1,
    restDelta: 0.0001,
  });

  /* Cards translate RIGHT -> LEFT */
  const cardsX = useTransform(smoothProgress, [0, 1], [0, -distances.cards]);

  /* Top scrubber node translates LEFT -> RIGHT (Opposite direction) */
  const indicatorX = useTransform(smoothProgress, [0, 1], [0, distances.indicator]);

  return (
    <div ref={targetRef} className="relative h-[180vh] bg-[#242C26] select-none overflow-clip">
      {/* Sticky viewport panel matching full screen height */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-6 pb-10">

        {/* ─── Top Linear Indicator Line (Opposite Motion: Left -> Right) ─── */}
        <div className="w-full px-6 sm:px-12 flex justify-center shrink-0 my-3">
          <div
            ref={indicatorTrackRef}
            className="relative w-full max-w-4xl h-10 flex items-center justify-between"
          >
            {/* Background Dim Ticks Track */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-1">
              {TRACK_TICKS.map((i) => (
                <div
                  key={i}
                  className="w-[2px] h-[5px] bg-white/20 rounded-full"
                />
              ))}
            </div>

            {/* Hardware-Accelerated Scrubber Node sliding LEFT -> RIGHT */}
            <motion.div
              ref={scrubberRef}
              style={{ x: indicatorX }}
              className="relative z-10 flex items-center gap-[3px] py-1 px-2 bg-[#242C26]/90 backdrop-blur-sm rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              {SCRUBBER_BARS.map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}px` }}
                  className="w-[3px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* ─── Review Cards Row (Motion: Right -> Left as user scrolls down) ─── */}
        <div className="flex-1 flex items-center overflow-hidden py-2">
          <motion.div
            ref={trackRef}
            style={{ x: cardsX }}
            className="flex items-start gap-6 sm:gap-8 px-8 sm:px-16 w-max"
          >
            {REVIEWS.map((r) => (
              <motion.div
                key={r.id}
                style={{ marginTop: r.topOffset }}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-[300px] sm:w-[340px] md:w-[360px] shrink-0 bg-[#D4CDC0] rounded-2xl p-6 sm:p-7 flex flex-col gap-5 cursor-default select-none shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              >
                {/* Header: Avatar + Info */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm border border-black/10"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#141C16] leading-tight">
                      {r.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#525E55] mt-0.5 font-medium">
                      {r.role}
                    </p>
                  </div>
                </div>

                {/* Quote Body */}
                <p className="text-[14px] sm:text-[15px] text-[#1D271F] leading-[1.6] font-normal">
                  {r.quote}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}




