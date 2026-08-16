import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashIntro({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.2 seconds, then animate scale into navbar
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.15,
            x: '-42vw',
            y: '-44vh',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[200] bg-[#0A1610] text-white flex flex-col items-center justify-center p-6 select-none pointer-events-none"
        >
          {/* Ambient Glow background */}
          <div className="absolute w-[500px] h-[500px] bg-[#96CD7B]/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center z-10"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#96CD7B]/30 rounded-3xl blur-xl" />
              <img
                src="/logo.png"
                alt="NaturePulse Logo"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-2xl border-2 border-white/20"
              />
            </div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white"
            >
              NaturePulse
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 text-sm sm:text-base text-[#96CD7B] font-mono tracking-widest uppercase font-semibold"
            >
              Nature Relationship Platform
            </motion.p>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-4 max-w-md text-xs sm:text-sm text-white/70 font-light leading-relaxed"
            >
              Connecting everyday surroundings into deep ecological discovery.
            </motion.p>
          </motion.div>

          {/* Animated loading bar */}
          <div className="absolute bottom-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="w-full h-full bg-[#96CD7B]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
