import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

export default function AnimatedStatCard({ value, label, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  // once: false allows the counter animation to restart repeatedly whenever scrolled into view
  const isInView = useInView(ref, { amount: 0.3, once: false });
  const [displayValue, setDisplayValue] = useState(0);

  // Extract numeric target from values like "12k+", "450+", "80k", "100%"
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const isK = value.includes('k');
  const isPlus = value.includes('+');
  const isPercent = value.includes('%');

  useEffect(() => {
    if (isInView) {
      setDisplayValue(0);
      const controls = animate(0, numericTarget, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1], // Smooth acceleration & fast count up to target
        onUpdate(latest) {
          setDisplayValue(Math.floor(latest));
        },
      });

      return () => controls.stop();
    } else {
      setDisplayValue(0);
    }
  }, [isInView, numericTarget]);

  return (
    <div ref={ref} className="text-center group select-none">
      <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md transition-transform duration-300 group-hover:scale-105">
        {prefix}
        {isInView ? displayValue : 0}
        {isK ? 'k' : ''}
        {isPlus ? '+' : ''}
        {isPercent ? '%' : ''}
        {suffix}
      </p>
      <p className="mt-2.5 text-xs sm:text-sm uppercase tracking-[0.2em] text-white/85 font-semibold">
        {label}
      </p>
    </div>
  );
}
