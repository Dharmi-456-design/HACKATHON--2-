import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashIntro({ onComplete }) {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('np_splash_seen');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isVisible) {
      if (onComplete) onComplete();
      return;
    }

    try {
      sessionStorage.setItem('np_splash_seen', '1');
    } catch {}

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[9999] bg-[#0A1610] text-white flex flex-col items-center justify-center p-6 select-none pointer-events-none"
        >
          <div className="flex flex-col items-center text-center z-10">
            <img
              src="/logo.webp"
              alt="NaturePulse Logo"
              width="64"
              height="64"
              className="w-16 h-16 rounded-2xl object-cover shadow-2xl border border-white/20 mb-3"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              NaturePulse
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
