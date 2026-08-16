import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const DEFAULT_STATS = { users: 12450, observations: 48920 };

export const usePublicStats = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  useEffect(() => {
    apiFetch('/api/stats', {}, null)
      .then((d) => {
        if (d && typeof d.users === 'number') setStats(d);
      })
      .catch(() => {});
  }, []);
  return stats;
};
