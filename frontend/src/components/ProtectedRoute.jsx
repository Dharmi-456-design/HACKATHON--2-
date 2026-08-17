import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, ensureUserOrGuest } = useAuth();
  const [initializingGuest, setInitializingGuest] = useState(false);

  useEffect(() => {
    if (!loading && !user && ensureUserOrGuest) {
      setInitializingGuest(true);
      ensureUserOrGuest().finally(() => setInitializingGuest(false));
    }
  }, [loading, user, ensureUserOrGuest]);

  if (loading || initializingGuest) {
    return (
      <div className="min-h-screen bg-[#0A1610] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#96CD7B]/30 border-t-[#96CD7B] animate-spin" />
          <p className="text-sm text-slate-300 font-sans">Setting up secure session…</p>
        </div>
      </div>
    );
  }

  return children;
}
