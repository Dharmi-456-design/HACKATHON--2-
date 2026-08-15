import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Sunset, Moon } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Card } from './ui';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getLocalSuggestion() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return { condition: 'morning', suggestion: 'Golden hour — perfect for birds and dew on leaves.', Icon: Sun };
  if (h >= 10 && h < 16) return { condition: 'midday', suggestion: 'Midday — look for shade-loving fungi and insects under bark.', Icon: Cloud };
  if (h >= 16 && h < 20) return { condition: 'evening', suggestion: 'Evening glow — best light for plant photography and bats emerging.', Icon: Sunset };
  return { condition: 'night', suggestion: 'Night — listen for frogs, crickets, and watch for bats silhouetted against the sky.', Icon: Moon };
}

export default function BestTimeToExplore() {
  const [data, setData] = useState(null);

  const load = () => {
    apiFetch('/api/best-time')
      .then((d) => setData(d))
      .catch(() => setData(getLocalSuggestion()));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const info = data || getLocalSuggestion();
  const Icon = info.Icon || Sun;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ rotate: prefersReducedMotion() ? 0 : -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="shrink-0 mt-0.5"
        >
          <Icon size={20} className="text-gold" />
        </motion.div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-forest/45">Best time to explore today</p>
          <p className="text-sm text-forest/80 mt-1 leading-relaxed">{info.suggestion}</p>
        </div>
      </div>
    </Card>
  );
}
