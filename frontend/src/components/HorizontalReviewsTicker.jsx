import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Jimmy Slagle',
    role: 'Parker AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    quote: 'Alexandr is an artist. Absolutely brilliant. He is someone who loves the craft of design. His first message to me was "I don\'t want to do what every other AI company does. I want it to be unique."',
  },
  {
    id: 2,
    name: 'Ty Zamkow',
    role: 'Nolana AI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    quote: 'Alexandr did an outstanding job on our logo! He\'s incredibly responsive, fully dedicated, and went above and beyond to ensure we achieved the perfect result.',
  },
  {
    id: 3,
    name: 'Nathan Graville',
    role: 'Gaviti',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    quote: 'Alex has been amazing. Only a month in, but Produx Design took a very active role in our operation already in terms of web, UI/UX, and eventual marketing.',
  },
  {
    id: 4,
    name: 'Delbert Ty',
    role: 'Gather AI',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80',
    quote: 'Great experience working together. The team went above and beyond expectations at every stage and brought strong thinking, taste, and attention to detail.',
  },
  {
    id: 5,
    name: 'Arianna Armelli',
    role: 'Dorothy Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    quote: 'Produx brand sprint exceeded our expectations. They captured our vision perfectly, delivering a cohesive and impactful brand.',
  },
  {
    id: 6,
    name: 'Fawaz Buqammaz',
    role: 'SOOR',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    quote: 'Honestly, we were given a better design than we asked for. Highly responsive, professional, and delivered top tier craftsmanship.',
  },
  {
    id: 7,
    name: 'Marcus Vance',
    role: 'Vance EcoLabs',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80',
    quote: 'The attention to detail and interaction physics is unbelievable. They transformed our platform user experience completely within days.',
  },
  {
    id: 8,
    name: 'Elena Rostova',
    role: 'BioTrack Systems',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    quote: 'Outstanding brand identity and UI execution. The team exceeded all our performance and aesthetic expectations by a mile.',
  },
  {
    id: 9,
    name: 'Devin Sterling',
    role: 'Atlas AI',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80',
    quote: 'Working with this team felt like pair programming with world-class product designers. Highly recommended for any serious venture!',
  },
];

const TOTAL_TICKS = 110;

export default function HorizontalReviewsTicker() {
  const sectionRef = useRef(null);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Physics spring for super silky smooth horizontal movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0001,
  });

  // Track spring progress value for mini-line equalizer peak
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    setScrollFraction(Math.min(Math.max(latest, 0), 1));
  });

  // Smooth horizontal translation from 0% to -80%
  const x = useTransform(smoothProgress, [0, 1], ['0%', '-80%']);

  // Continuous float center index (no integer snapping) for liquid smooth wave peak
  const floatCenterIndex = scrollFraction * (TOTAL_TICKS - 1);

  return (
    <section ref={sectionRef} className="relative h-[360vh] bg-[#1C3727] text-white">
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden py-10 px-6 sm:px-12 select-none">
        
        {/* Section Header */}
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#96CD7B] font-semibold mb-1">
              COMMUNITY TRUST
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Beyond clients. Trusted partners.
            </h2>
          </div>

          <a
            href="#community"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-white/70 hover:text-[#96CD7B] transition-colors group mb-1"
          >
            Read all reviews <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ────────────────── LIQUID SMOOTH MINI-LINE EQUALIZER SCRUBBER ────────────────── */}
        <div className="w-full max-w-7xl mx-auto my-6 px-2 flex items-center justify-between gap-[2px] z-10 h-10">
          {[...Array(TOTAL_TICKS)].map((_, i) => {
            const dist = Math.abs(i - floatCenterIndex);
            
            // Continuous Gaussian smooth bell curve (no skipping/stepping!)
            const intensity = Math.max(0, 1 - dist / 5.5);
            const heightPx = 8 + Math.pow(intensity, 1.8) * 24;
            const opacity = 0.2 + intensity * 0.8;
            const isPeak = intensity > 0.6;

            return (
              <div
                key={i}
                style={{
                  height: `${heightPx}px`,
                  opacity: opacity,
                  backgroundColor: isPeak ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                }}
                className="w-[2px] sm:w-[3px] rounded-full transition-all duration-75 ease-out shadow-xs"
              />
            );
          })}
        </div>

        {/* ────────────────── STICKY HORIZONTAL CAROUSEL WITH STAIRCASE & HOVER FADE ────────────────── */}
        <div className="w-full flex-1 flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-8 pl-4 sm:pl-12 w-max items-center">
            {REVIEWS.map((rev, idx) => {
              const isHovered = hoveredId === rev.id;
              const hasHover = hoveredId !== null;

              // Staircase offset effect (alternating heights as seen in Image 3 & 4)
              const staircaseOffsets = [0, 36, 18, 50, 10, 42, 22, 48, 14];
              const yOffset = staircaseOffsets[idx % staircaseOffsets.length];

              return (
                <motion.div
                  key={rev.id}
                  onMouseEnter={() => setHoveredId(rev.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ transform: `translateY(${yOffset}px)` }}
                  animate={{
                    opacity: hasHover ? (isHovered ? 1 : 0.22) : 1,
                    scale: isHovered ? 1.04 : hasHover ? 0.96 : 1,
                    filter: hasHover && !isHovered ? 'blur(2.5px)' : 'blur(0px)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`w-[340px] sm:w-[400px] lg:w-[440px] shrink-0 rounded-3xl p-8 sm:p-9 shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                    isHovered
                      ? 'bg-[#E5E0DC] text-[#14261C] border-white shadow-2xl z-30'
                      : 'bg-[#DCD7D3] text-[#14261C] border-white/40 hover:border-white'
                  }`}
                >
                  <div>
                    {/* User Profile Header */}
                    <div className="flex items-center gap-3.5 mb-6">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#14261C]/20 shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-semibold text-base sm:text-lg leading-tight text-[#14261C]">
                          {rev.name}
                        </h4>
                        <p className="text-xs text-[#14261C]/60 mt-0.5">{rev.role}</p>
                      </div>

                      <div className="ml-auto flex gap-0.5 text-[#C49535]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    {/* Review Quote */}
                    <p className="text-base sm:text-lg text-[#14261C]/90 leading-relaxed font-normal">
                      "{rev.quote}"
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-8 pt-5 border-t border-[#14261C]/10 flex items-center justify-between text-xs text-[#14261C]/60 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Quote size={13} className="text-[#1C3727]" /> Verified Partner
                    </span>
                    <span>Nature Explorer</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll Progress Hint Bar */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/10 z-10 shrink-0">
          <span>Scroll to navigate comments</span>
          <span>{Math.round(scrollFraction * 100)}% viewed</span>
        </div>

      </div>
    </section>
  );
}
