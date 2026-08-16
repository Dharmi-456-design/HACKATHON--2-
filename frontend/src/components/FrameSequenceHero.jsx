import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Sparkles, ShieldCheck, Compass, MapPin } from 'lucide-react';

const TOTAL_FRAMES = 155;

export default function FrameSequenceHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Preload all 155 high-resolution 24fps frames into memory
  useEffect(() => {
    let loadedCount = 0;
    const loadedImgs = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(6, '0');
      img.src = `/moss_frames/frame_${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      loadedImgs.push(img);
    }
    imagesRef.current = loadedImgs;
  }, []);

  // Draw frame to canvas centered and properly scaled
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Maintain aspect ratio cover / contain
    const hRatio = cw / img.width;
    const vRatio = ch / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (cw - img.width * ratio) / 2;
    const centerShiftY = (ch - img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );
  };

  // Draw frame 0 initially when loaded
  useEffect(() => {
    if (imagesLoaded) {
      drawFrame(0);
    }
  }, [imagesLoaded]);

  // Update frame on scroll
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(latest * TOTAL_FRAMES)
    );
    drawFrame(frameIndex);

    if (latest < 0.33) setActiveStep(0);
    else if (latest < 0.66) setActiveStep(1);
    else setActiveStep(2);
  });

  // Responsive Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 600;
      drawFrame(0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  const steps = [
    {
      subtitle: 'NATURE RELATIONSHIP PLATFORM',
      heading: 'In 14 days, we shape a living ecological identity.',
      body: 'NaturePulse turns your everyday surroundings into a deep layer of quiet discovery — connecting field notes, species tracking, and urban biodiversity.',
    },
    {
      subtitle: 'STAND OUT & OBSERVE',
      heading: 'Observe nature\'s thread with precision & intelligence.',
      body: 'Pulse AI connects isolated observations into a single narrative, helping you tune into dawn birdsong, native trees, and seasonal rhythms.',
    },
    {
      subtitle: 'MEASURE & RETURN',
      heading: 'Build lasting trust with your local ecosystem.',
      body: 'Track your 5-dimensional Nature Connection score over time and collaborate with a thriving community of urban explorers.',
    },
  ];

  return (
    <div ref={containerRef} className="relative h-[320vh] bg-[#0E1E15] text-white">
      {/* Sticky viewport container - Locks page scroll during 24fps sequence */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Background glow radial accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#96CD7B]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[E6C176]/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-8 items-center z-10">
          
          {/* Left Column: Animated Text Copy */}
          <div className="lg:col-span-5 z-20 space-y-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                <Sparkles size={13} />
                {steps[activeStep].subtitle}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
                {steps[activeStep].heading}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed font-light">
                {steps[activeStep].body}
              </p>

              {/* Step indicator bars */}
              <div className="flex items-center gap-2 pt-6">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      activeStep === idx ? 'w-8 bg-[#96CD7B]' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: 24fps Image Sequence Canvas + Glassmorphism Badges */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[580px]">
            
            {/* HTML5 Canvas Container */}
            <div className="relative w-full h-[450px] sm:h-[550px] flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0E1E15]">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />

              {!imagesLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0E1E15] text-white/60 text-sm">
                  Loading 24fps animation frames...
                </div>
              )}
            </div>

            {/* Floating Tooltip Pins (Glassmorphism badges) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: activeStep === 0 ? 1 : 0.3, scale: activeStep === 0 ? 1 : 0.9, x: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute top-8 right-4 sm:right-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#96CD7B]/20 flex items-center justify-center text-[#96CD7B]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Nature Connection</p>
                  <p className="text-[10px] text-white/60">Verified in 14 Days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: activeStep === 1 ? 1 : 0.3, scale: activeStep === 1 ? 1 : 0.9, x: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-20 left-4 sm:left-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Compass size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Stand out & earn trust</p>
                  <p className="text-[10px] text-white/60">AI Field Notebook</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: activeStep === 2 ? 1 : 0.3, scale: activeStep === 2 ? 1 : 0.9, y: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-6 right-6 sm:right-16 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Launch faster & grow</p>
                  <p className="text-[10px] text-white/60">Active Habitats</p>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-xs tracking-widest uppercase">
          <span>Scroll to play sequence</span>
          <div className="w-5 h-8 rounded-full border border-white/40 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
