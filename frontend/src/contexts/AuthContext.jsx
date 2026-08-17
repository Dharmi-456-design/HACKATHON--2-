import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '../lib/api';
import { supabase } from '../lib/supabase';
import { signInWithGoogle as performGoogleSignIn } from '../lib/googleAuth';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext({
  user: null,
  token: null,
  session: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs for deduplication — shared across async calls and listeners
  const lastExchangedTokenRef = useRef(null);
  const initDoneRef = useRef(false);

  // Exchange a Supabase OAuth session for a NaturePulse backend JWT.
  // Deduplicates by access_token to prevent the same session from triggering
  // multiple POST /api/auth/google calls.
  const exchangeSupabaseSession = useCallback(async (session) => {
    if (!session?.user?.email) return null;

    // Skip if we already exchanged this exact token
    const accessToken = session.access_token;
    if (accessToken === lastExchangedTokenRef.current) return null;
    // Lock immediately to block concurrent calls with the same token
    lastExchangedTokenRef.current = accessToken;

    try {
      const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
        }),
      });
      if (data?.token && data?.user) return data;
    } catch (err) {
      // Exchange failed — unlock so a retry is possible if the user retries
      lastExchangedTokenRef.current = null;
      // Silently clear the stale Supabase session from localStorage
      try {
        const key = Object.keys(localStorage).find(
          (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
        );
        if (key) localStorage.removeItem(key);
      } catch {}
    }
    return null;
  }, []);

  // Clean OAuth callback hash/query params from the URL without triggering navigation
  const cleanOAuthUrl = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      if (url.hash && (url.hash.includes('access_token') || url.hash.includes('error_description'))) {
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    } catch {}
  }, []);

  // On mount: restore session from backend JWT or Supabase OAuth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 1. Try backend JWT first (fast path — no external call needed if token is valid)
      const storedToken = getToken();
      if (storedToken) {
        try {
          const data = await apiFetch('/api/auth/me', {}, storedToken);
          if (mounted && data?.user) {
            setUser(data.user);
            setAuthToken(storedToken);
            setLoading(false);
            initDoneRef.current = true;
            return;
          }
        } catch {
          clearToken();
        }
      }

      // 2. No valid backend JWT — try Supabase session (e.g. after OAuth redirect)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const exchanged = await exchangeSupabaseSession(session);
          if (!mounted) return;

          if (exchanged) {
            setUser(exchanged.user);
            setAuthToken(exchanged.token);
            setToken(exchanged.token);
            cleanOAuthUrl();
          }
        }
      } catch {}

      if (mounted) {
        setLoading(false);
        initDoneRef.current = true;
      }
    };

    initAuth();

    // Listen to Supabase Auth State Changes (OAuth redirect callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // INITIAL_SESSION: session restored from storage — already handled by initAuth
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_IN' && session?.user) {
          const exchanged = await exchangeSupabaseSession(session);
          if (!mounted) return;
          if (exchanged) {
            setUser(exchanged.user);
            setAuthToken(exchanged.token);
            setToken(exchanged.token);
            cleanOAuthUrl();
          } else {
            // Exchange failed — clear state
            setUser(null);
            setAuthToken(null);
            clearToken();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthToken(null);
          clearToken();
        }
      }
    );

    // Check custom backend JWT
    const checkBackendAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      // If it's a demo instant token, keep the active session
      if (storedToken.startsWith('demo-')) {
        if (mounted) {
          setUser({
            id: 'user-demo-instant',
            name: 'Nature Explorer',
            email: 'explorer@naturepulse.org',
            city: 'Ahmedabad',
            avatar: '🌳',
          });
          setAuthToken(storedToken);
          setLoading(false);
        }
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
        // Don't immediately wipe token on network errors
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Safety fallback: Never trap app in loading state for more than 800ms
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 800);

    // Initialize Auth
    checkSupabaseAuth().then((hasSbSession) => {
      if (!hasSbSession) {
        checkBackendAuth();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription?.unsubscribe();
    };
  }, [exchangeSupabaseSession, cleanOAuthUrl]);

  const demoLogin = useCallback(() => {
    console.warn('[AuthContext] Demo login is disabled. Use a real account.');
    return null;
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
      return data;
    }
    throw new Error('Login failed');
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
      return data;
    }
    throw new Error('Registration failed');
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo) => {
    return performGoogleSignIn(redirectTo);
  }, []);

  const logout = useCallback(async () => {
    lastExchangedTokenRef.current = null;
    try {
      await supabase.auth.signOut();
    } catch {}
    clearToken();
    setAuthToken(null);
    setUser(null);
  }, []);

  const ensureUserOrGuest = useCallback(async () => {
    if (user && token) return { user, token };
    try {
      const guestEmail = `guest_${Date.now()}@naturepulse.app`;
      const data = await register({
        name: 'Explorer Guest',
        email: guestEmail,
        password: 'GuestExplorerPass123!',
      });
      return data;
    } catch (err) {
      console.warn('[ensureUserOrGuest] Guest registration failed:', err);
      return null;
    }
  }, [user, token, register]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        session: token ? { access_token: token, user } : null,
        loading,
        login,
        register,
        demoLogin,
        ensureUserOrGuest,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
