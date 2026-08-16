import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    apiFetch('/api/stats', {}, null)
      .then((d) => setStats(d && typeof d.users === 'number' ? d : null))
      .catch(() => setStats(null));
  }, []);
  return stats;
};
