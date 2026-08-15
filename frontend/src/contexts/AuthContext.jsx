import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

// ── Demo user object (fake — never touches Supabase) ─────────────────────────
const DEMO_USER = {
  id: 'demo-user-00000000',
  email: 'demo@naturepulse.app',
  user_metadata: { full_name: 'Demo Explorer' },
};
const DEMO_SESSION = {
  access_token: 'demo-token',
  user: DEMO_USER,
};
const DEMO_KEY = 'np_demo_login';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext({ user: null, session: null, loading: true, isDemoUser: false });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // On mount: check if demo mode was persisted
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_KEY) === '1') {
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore real auth events if we are in demo mode
      if (sessionStorage.getItem(DEMO_KEY) === '1') return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Public helpers ──────────────────────────────────────────────────────────
  const enterDemoMode = useCallback(() => {
    sessionStorage.setItem(DEMO_KEY, '1');
    // Also activate demoMode for API fallbacks
    sessionStorage.setItem('np_demo', '1');
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    setIsDemoUser(true);
    setLoading(false);
  }, []);

  const exitDemoMode = useCallback(async () => {
    sessionStorage.removeItem(DEMO_KEY);
    sessionStorage.removeItem('np_demo');
    setUser(null);
    setSession(null);
    setIsDemoUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemoUser, enterDemoMode, exitDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
