import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '../lib/api';
import { supabase } from '../lib/supabase';
import { signInWithGoogle as performGoogleSignIn } from '../lib/googleAuth';
import { isDemoMode } from '../utils/demoMode';

// ── Demo user object (only used when demo mode is explicitly enabled) ────────
const DEMO_USER = {
  id: 'demo-user-00000000',
  email: 'demo@naturepulse.app',
  name: 'Demo Explorer',
};
const DEMO_KEY = 'np_demo_login';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext({
  user: null,
  token: null,
  session: null,
  loading: true,
  isDemoUser: false,
  login: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  logout: () => {},
  enterDemoMode: () => {},
  exitDemoMode: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Helper to format Supabase user into NaturePulse user schema
  const formatSupabaseUser = (sbUser) => {
    if (!sbUser) return null;
    return {
      id: sbUser.id,
      email: sbUser.email,
      name:
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        sbUser.user_metadata?.user_name ||
        (sbUser.email ? sbUser.email.split('@')[0] : 'Explorer'),
      role: 'citizen',
      points: 50,
      avatar_url: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
    };
  };

  // On mount: restore session from Supabase OAuth or local JWT
  useEffect(() => {
    let mounted = true;

    // Check demo mode first
    if (sessionStorage.getItem(DEMO_KEY) === '1' && isDemoMode()) {
      setUser(DEMO_USER);
      setAuthToken('demo-token');
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // Check Supabase session for Google Auth
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return false;

        if (session && session.user) {
          const appUser = formatSupabaseUser(session.user);
          setUser(appUser);
          setAuthToken(session.access_token);
          setToken(session.access_token);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase session check skipped:', err);
      }
      return false;
    };

    // Check custom backend JWT
    const checkBackendAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/api/auth/me', {}, storedToken);
        if (!mounted) return;
        if (data?.user) {
          setUser(data.user);
          setAuthToken(storedToken);
        } else {
          clearToken();
        }
      } catch {
        if (mounted) clearToken();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Initialize Auth
    checkSupabaseAuth().then((hasSbSession) => {
      if (!hasSbSession) {
        checkBackendAuth();
      }
    });

    // Listen to Supabase Auth State Changes (e.g. Google OAuth redirect callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session && session.user) {
        const appUser = formatSupabaseUser(session.user);
        setUser(appUser);
        setAuthToken(session.access_token);
        setToken(session.access_token);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        if (!sessionStorage.getItem(DEMO_KEY)) {
          setUser(null);
          setAuthToken(null);
          clearToken();
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data?.token && data?.user) {
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data?.token && data?.user) {
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo) => {
    return performGoogleSignIn(redirectTo);
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    clearToken();
    setAuthToken(null);
    setUser(null);
    setIsDemoUser(false);
    sessionStorage.removeItem(DEMO_KEY);
    sessionStorage.removeItem('np_demo');
  }, []);

  const enterDemoMode = useCallback(() => {
    sessionStorage.setItem(DEMO_KEY, '1');
    sessionStorage.setItem('np_demo', '1');
    setUser(DEMO_USER);
    setAuthToken('demo-token');
    setIsDemoUser(true);
    setLoading(false);
  }, []);

  const exitDemoMode = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        session: token ? { access_token: token, user } : null,
        loading,
        isDemoUser,
        login,
        register,
        signInWithGoogle,
        logout,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
