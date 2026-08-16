import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85";
const FRONT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4";
const OVERLAY_IMAGE = "https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png";

const SPOTLIGHT_R = 260;

export default function MeasuredHero() {
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const gridParallaxRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const canvasRef = useRef(null);
  const [maskUrl, setMaskUrl] = useState('');
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Device');

  // Lock body overflow when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Setup Canvas size for mask generation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Smooth Cursor & Parallax RAF Loop
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      if (mouseRef.current.x !== -999) {
        if (smoothRef.current.x === -999) {
          smoothRef.current = { ...mouseRef.current };
        } else {
          smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
          smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;
        }

        // Calculate grid parallax shift (offset based on cursor from center * 16, lerped 0.06)
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const targetGridX = ((smoothRef.current.x - cx) / cx) * 16;
        const targetGridY = ((smoothRef.current.y - cy) / cy) * 16;

        gridParallaxRef.current.x += (targetGridX - gridParallaxRef.current.x) * 0.06;
        gridParallaxRef.current.y += (targetGridY - gridParallaxRef.current.y) * 0.06;

        setGridOffset({ x: gridParallaxRef.current.x, y: gridParallaxRef.current.y });

        // Draw Canvas Mask Gradient
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const grad = ctx.createRadialGradient(
              smoothRef.current.x,
              smoothRef.current.y,
              0,
              smoothRef.current.x,
              smoothRef.current.y,
              SPOTLIGHT_R
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
            grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(smoothRef.current.x, smoothRef.current.y, SPOTLIGHT_R, 0, Math.PI * 2);
            ctx.fill();

            setMaskUrl(canvas.toDataURL());
          }
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

  const navItems = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white text-white select-none font-helvetica-neue" style={{ height: '100vh' }}>
      
      {/* Hidden Canvas for Mask DataURL */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />

      {/* ────────────────────── NAVIGATION (FIXED Z-50) ────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-5 md:p-6 pointer-events-none">
        
        {/* Top-Left Geometric SVG Logo */}
        <div className="pointer-events-auto flex items-center">
          <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center p-2 shadow-lg">
            <svg className="w-7 h-7" viewBox="0 0 256 256" fill="#ffffff">
              <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
            </svg>
          </div>
        </div>

        {/* Center Pill Nav (Desktop) */}
        <nav className="hidden md:flex pointer-events-auto fixed top-5 left-1/2 -translate-x-1/2 liquid-glass rounded-full px-2 py-1.5 items-center gap-1 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === item ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Top-Right Reserve Yours CTA (Desktop) */}
        <div className="hidden md:flex pointer-events-auto">
          <button className="liquid-glass rounded-full px-5 py-2 flex items-center gap-2 text-white text-sm font-medium cursor-pointer hover:bg-white/10 transition-all shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Reserve Yours</span>
          </button>
        </div>

        {/* Mobile Hamburger Pill Button (Mobile) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden pointer-events-auto liquid-glass rounded-full w-10 h-10 flex flex-col items-center justify-center gap-1.5 shadow-lg cursor-pointer"
          aria-label="Open Menu"
        >
          <div className="w-5 h-[1.5px] bg-white rounded-full" />
          <div className="w-3.5 h-[1.5px] bg-white rounded-full" />
        </button>
      </header>

      {/* ────────────────────── MOBILE FULLSCREEN MENU (Z-55) ────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-[#0a0a0a] text-white flex flex-col justify-between p-8 md:hidden select-none"
          >
            {/* Top Bar with Rotating Close Button */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center p-2">
                <svg className="w-7 h-7" viewBox="0 0 256 256" fill="#ffffff">
                  <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
                </svg>
              </div>

              <motion.button
                initial={{ rotate: -90, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.77, 0, 0.18, 1] }}
                onClick={() => setMobileMenuOpen(false)}
                className="liquid-glass rounded-full w-10 h-10 flex items-center justify-center relative cursor-pointer"
                aria-label="Close Menu"
              >
                <div className="w-5 h-[1.5px] bg-white absolute rotate-45" />
                <div className="w-5 h-[1.5px] bg-white absolute -rotate-45" />
              </motion.button>
            </div>

            {/* Vertically Stacked Nav Items */}
            <div className="flex flex-col items-center gap-6 my-auto">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + idx * 0.06,
                    ease: [0.77, 0, 0.18, 1],
                  }}
                  onClick={() => {
                    setActiveTab(item);
                    setMobileMenuOpen(false);
                  }}
                  className="text-3xl sm:text-4xl font-medium text-white/90 hover:text-white tracking-tight cursor-pointer"
                >
                  {item}
                </motion.button>
              ))}
            </div>

            {/* Bottom Reserve CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.77, 0, 0.18, 1] }}
              className="flex justify-center pb-4"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="liquid-glass rounded-full px-8 py-3.5 flex items-center gap-2.5 text-white text-base font-medium cursor-pointer shadow-xl"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span>Reserve Yours</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────── HERO FULLSCREEN VIEWPORT SECTION ────────────────────── */}
      <section className="relative w-full h-full overflow-hidden bg-[#050505]">
        
        {/* Layer 1 — Grid Background (z-0, opacity 0.1 with Cursor Parallax) */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`,
          }}
        >
          <svg className="w-full h-full" width="100%" height="100%">
            <defs>
              <pattern id="hero-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
          </svg>
        </div>

        {/* Layer 2 — Background Image (z-10) */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Layer 3 — Hero Text (z-20) */}
        <div className="absolute top-20 sm:top-28 md:top-32 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <h1 className="font-instrument-serif text-[4.5rem] xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] leading-[0.9] text-white font-normal tracking-tight text-center drop-shadow-2xl">
            Measured
          </h1>
        </div>

        {/* Layer 4 — Overlay Image (z-25) */}
        <img
          src={OVERLAY_IMAGE}
          alt="Atmospheric Overlay"
          className="absolute inset-0 z-25 w-full h-full object-cover pointer-events-none opacity-80 mix-blend-screen"
        />

        {/* Layer 5 — Spotlight Mask Video Reveal (z-30, clipped to bottom 60%) */}
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            clipPath: 'inset(40% 0 0 0)',
            maskImage: maskUrl ? `url(${maskUrl})` : 'none',
            WebkitMaskImage: maskUrl ? `url(${maskUrl})` : 'none',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
          }}
        >
          <video
            src={FRONT_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

      </section>

    </div>
  );
}
