import { useState, useEffect, useRef } from 'react';

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85';
const FRONT_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4';
const OVERLAY_IMAGE = 'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png';

export default function MeasuredHeroSection() {
  const containerRef = useRef(null);

  // Mouse & Lerp State Refs
  const targetPos = useRef({ x: -1000, y: -1000 });
  const smoothPos = useRef({ x: -1000, y: -1000 });
  const targetGrid = useRef({ x: 0, y: 0 });
  const smoothGrid = useRef({ x: 0, y: 0 });

  const [maskStyle, setMaskStyle] = useState({});
  const [gridTransform, setGridTransform] = useState('');

  // Handle Mouse Movement
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };

    // Calculate grid relative offset (-1 to 1)
    const relX = (x - rect.width / 2) / (rect.width / 2);
    const relY = (y - rect.height / 2) / (rect.height / 2);
    targetGrid.current = { x: relX * 16, y: relY * 16 };
  };

  const handleMouseLeave = () => {
    targetPos.current = { x: -1000, y: -1000 };
    targetGrid.current = { x: 0, y: 0 };
  };

  // Lerp Animation Loop
  useEffect(() => {
    let animId;
    const updateLoop = () => {
      // Lerp spotlight cursor (0.1 factor)
      smoothPos.current.x += (targetPos.current.x - smoothPos.current.x) * 0.1;
      smoothPos.current.y += (targetPos.current.y - smoothPos.current.y) * 0.1;

      // Lerp grid parallax (0.06 factor)
      smoothGrid.current.x += (targetGrid.current.x - smoothGrid.current.x) * 0.06;
      smoothGrid.current.y += (targetGrid.current.y - smoothGrid.current.y) * 0.06;

      const sx = smoothPos.current.x.toFixed(2);
      const sy = smoothPos.current.y.toFixed(2);

      const radialGradient = `radial-gradient(circle 260px at ${sx}px ${sy}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)`;

      setMaskStyle({
        WebkitMaskImage: radialGradient,
        maskImage: radialGradient,
      });

      setGridTransform(`translate3d(${smoothGrid.current.x.toFixed(2)}px, ${smoothGrid.current.y.toFixed(2)}px, 0)`);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const navLinks = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen overflow-hidden bg-black select-none font-helvetica-neue"
    >


      {/* ──────────────── LAYER 1 — GRID BACKGROUND (z-0) ──────────────── */}
      <div
        style={{ transform: gridTransform }}
        className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-transform duration-75 ease-out"
      >
        <svg className="w-full h-full" width="100%" height="100%">
          <defs>
            <pattern
              id="grid-pattern-measured"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-measured)" />
        </svg>
      </div>

      {/* ──────────────── LAYER 2 — BACKGROUND IMAGE (z-10) ──────────────── */}
      <div
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat pointer-events-none"
      />

      {/* ──────────────── LAYER 3 — HERO TEXT (z-20) ──────────────── */}
      <div className="absolute top-16 sm:top-24 md:top-28 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
        <h1
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-[3.2rem] xs:text-[4.2rem] sm:text-[7.5rem] md:text-[10rem] lg:text-[12.5rem] leading-[0.9] text-white font-normal uppercase tracking-tight text-center"
        >
          NaturePulse
        </h1>
      </div>

      {/* ──────────────── LAYER 4 — OVERLAY IMAGE (z-25) ──────────────── */}
      <img
        src={OVERLAY_IMAGE}
        alt="Atmospheric Layer Overlay"
        className="absolute inset-0 z-25 w-full h-full object-cover pointer-events-none opacity-80"
      />

      {/* ──────────────── LAYER 5 — SPOTLIGHT REVEAL (z-30) ──────────────── */}
      <div
        style={{
          ...maskStyle,
          clipPath: 'inset(40% 0 0 0)',
        }}
        className="absolute inset-0 z-30 pointer-events-none"
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
    </div>
  );
}
