import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";
const SPOTLIGHT_R = 260;

function RevealLayer({ image, cursorX, cursorY }) {
  const active = cursorX !== -999 && cursorY !== -999;
  const maskStyle = active
    ? `radial-gradient(circle ${SPOTLIGHT_R}px at ${cursorX}px ${cursorY}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)`
    : 'none';

  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
      style={{
        backgroundImage: `url(${image})`,
        maskImage: maskStyle,
        WebkitMaskImage: maskStyle,
      }}
    />
  );
}

export default function LithosHero() {
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const { user, isDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user || isDemoUser) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      if (mouseRef.current.x !== -999) {
        const prev = smoothRef.current;
        const next =
          prev.x === -999
            ? { ...mouseRef.current }
            : {
                x: prev.x + (mouseRef.current.x - prev.x) * 0.1,
                y: prev.y + (mouseRef.current.y - prev.y) * 0.1,
              };
        smoothRef.current = next;
        if (prev.x === -999 || Math.abs(next.x - prev.x) > 0.5 || Math.abs(next.y - prev.y) > 0.5) {
          setCursorPos({ x: next.x, y: next.y });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative w-full tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ────────────────────── MAIN SPOTLIGHT HERO SECTION ────────────────────── */}
      <section className="relative w-full overflow-hidden h-screen bg-black select-none" style={{ height: '100dvh' }}>
        {/* Layer 1: Base Image (z-10) with Slow Ken Burns Zoom */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Layer 2: Reveal Layer (z-30) */}
        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* Layer 3: Main Heading (z-50) */}
        <div className="absolute top-[20%] sm:top-[16%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs uppercase tracking-[0.2em] font-semibold mb-4 pointer-events-auto shadow-md backdrop-blur-xs">
            <Sparkles size={13} /> AI-POWERED NATURE EXPLORATION
          </div>

          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Layers hold
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              tales of time
            </span>
          </h1>
        </div>

        {/* Layer 4: Bottom-Left Paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed font-light">
            Every observation records a living chapter of our planet — connecting bark textures, birdsong, and moss seams into deep ecological discovery.
          </p>
        </div>

        {/* Layer 5: Bottom-Right Block & NaturePulse CTA Button (z-50) - Cleaned as requested */}
        <div
          className="absolute bottom-10 sm:bottom-20 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
            Our AI-powered field maps let you observe urban ecology, track species telemetry, and discover living biodiversity across 450+ cities around you.
          </p>
          <button
            onClick={handleAction}
            className="inline-flex items-center gap-2 bg-[#96CD7B] hover:bg-white text-[#0A1610] text-sm font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-[#96CD7B]/25 cursor-pointer"
          >
            Explore Field Notebook <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
