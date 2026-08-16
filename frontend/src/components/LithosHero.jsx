import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BG_IMAGE_1 = "/images/hero_moss_base.webp";
const BG_IMAGE_2 = "/images/hero_moss_reveal.webp";

export default function LithosHero() {
  const layerRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    let mouseX = -999;
    let mouseY = -999;
    let smoothX = -999;
    let smoothY = -999;
    let rafId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const updateMask = () => {
      if (layerRef.current && mouseX !== -999 && mouseY !== -999) {
        if (smoothX === -999) {
          smoothX = mouseX;
          smoothY = mouseY;
        } else {
          smoothX += (mouseX - smoothX) * 0.15;
          smoothY += (mouseY - smoothY) * 0.15;
        }
        const grad = `radial-gradient(circle 280px at ${Math.round(smoothX)}px ${Math.round(smoothY)}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0) 100%)`;
        layerRef.current.style.maskImage = grad;
        layerRef.current.style.webkitMaskImage = grad;
      }
      rafId = requestAnimationFrame(updateMask);
    };

    rafId = requestAnimationFrame(updateMask);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full tracking-[-0.02em] font-sans">
      {/* ────────────────────── MAIN SPOTLIGHT HERO SECTION ────────────────────── */}
      <section className="relative w-full overflow-hidden h-screen bg-black select-none" style={{ height: '100dvh' }}>
        {/* Layer 1: Base Moss Landscape (z-10) with High Priority */}
        <img
          src={BG_IMAGE_1}
          alt="Nature Landscape with Moss and Flowers"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width="1600"
          height="900"
          className="absolute inset-0 w-full h-full object-cover z-10 hero-zoom pointer-events-none"
        />

        {/* Layer 2: Glowing Reveal Layer (z-30) — Spotlight Hover Mask */}
        <div
          ref={layerRef}
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
          style={{
            backgroundImage: `url(${BG_IMAGE_2})`,
            maskImage: 'none',
            WebkitMaskImage: 'none',
          }}
        />

        {/* Layer 3: Main Heading (z-50) */}
        <div className="absolute top-[20%] sm:top-[16%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs uppercase tracking-[0.2em] font-semibold mb-4 pointer-events-auto shadow-md backdrop-blur-xs">
            <Sparkles size={13} aria-hidden="true" /> AI NATURE RELATIONSHIP PLATFORM
          </div>

          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.15s' }}
            >
              Observe, understand,
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.25s' }}
            >
              experience nature
            </span>
          </h1>
        </div>

        {/* Layer 4: Bottom-Left Paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[300px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.4s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed font-light">
            NaturePulse connects everyday surroundings into deep ecological discovery — tracking species observations, Nature Lens AI telemetry, and 5-dimensional connection scores.
          </p>
        </div>

        {/* Layer 5: Bottom-Right Block & NaturePulse CTA Button (z-50) */}
        <div
          className="absolute bottom-10 sm:bottom-20 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[300px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.5s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
            Log daily field notes, discover nearby green sanctuaries, and join a thriving community of urban observers mapping living biodiversity around you.
          </p>
          <button
            onClick={handleAction}
            aria-label="Explore Nature Pulse"
            className="inline-flex items-center gap-2 bg-[#96CD7B] hover:bg-white text-[#0A1610] text-sm font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-[#96CD7B]/25 cursor-pointer"
          >
            Explore Nature Pulse <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
