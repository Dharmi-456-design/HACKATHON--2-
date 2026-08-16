import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function CountUp({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) { setDisplay(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 600, 1);
      setDisplay(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <span>{display}</span>;
}

export default function ExplorerStreak({ compact = false }) {
  const { session } = useAuth();
  const token = session?.access_token;
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/streak', {}, token)
      .then((d) => { if (d) setStreak(d.streak); })
      .catch(() => {});
  }, [token]);

  if (streak === null) return null;

  const size = streak >= 8 ? 20 : streak >= 4 ? 16 : 14;
  const colorCls = streak >= 8 ? 'text-orange-500' : streak >= 4 ? 'text-gold' : 'text-forest/60';

  if (compact) {
    return (
      <div
        className="flex items-center justify-center p-2 rounded-xl transition-colors hover:bg-mist/30"
        title={`${streak}-day explorer streak`}
      >
        <Flame size={18} className={colorCls} />
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      initial={{ scale: prefersReducedMotion() ? 1 : 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      title={`${streak}-day explorer streak`}
    >
      <Flame size={size} className={colorCls} />
      <span className="text-sm font-semibold tabular-nums">
        <CountUp target={streak} />
      </span>
      <span className="text-xs text-forest/50">day streak</span>
    </motion.div>
  );
}
