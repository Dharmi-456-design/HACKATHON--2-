import supabase from './supabase';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildGoogleUrl(appName) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_PROXY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!clientId || !redirectUri) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

export function signInWithGoogle(appName = 'NaturePulse') {
  return new Promise((resolve, reject) => {
    const url = buildGoogleUrl(appName);
    if (!url) {
      const err = new Error('Google Sign-In is not configured. Missing VITE_GOOGLE_CLIENT_ID or VITE_GOOGLE_AUTH_PROXY.');
      console.warn('[google-auth]', err.message);
      reject(err);
      return;
    }

    const popup = window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      reject(new Error('Popup blocked by browser. Please allow popups to sign in with Google.'));
      return;
    }

    let resolved = false;

    // Check if popup was closed by user
    const checkClosedInterval = setInterval(() => {
      if (popup.closed && !resolved) {
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', handler);
        resolved = true;
        reject(new Error('Sign-in popup was closed.'));
      }
    }, 1000);

    const handler = async (event) => {
      if (event.data?.type === 'google-auth-denied') {
        if (!resolved) {
          resolved = true;
          clearInterval(checkClosedInterval);
          window.removeEventListener('message', handler);
          reject(new Error('Google authentication access was denied.'));
        }
        return;
      }

      if (event.data?.type !== 'google-auth-success') return;

      if (!resolved) {
        resolved = true;
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', handler);

        try {
          if (event.data.access_token && event.data.refresh_token) {
            const { data, error } = await supabase.auth.setSession({
              access_token: event.data.access_token,
              refresh_token: event.data.refresh_token,
            });
            if (error) throw error;
            resolve(data);
          } else if (event.data.id_token) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: event.data.id_token,
            });
            if (error) throw error;
            resolve(data);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error('[google-auth] authentication failed:', err);
          reject(err instanceof Error ? err : new Error('Failed to complete Google authentication with backend.'));
        }
      }
    };

    window.addEventListener('message', handler);
  });
}

export async function handleGoogleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('google_id_token');
  if (!token) return;
  window.history.replaceState({}, '', window.location.pathname);
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
  if (error) {
    console.error('[google-auth] signInWithIdToken failed:', error.message);
    return;
  }
  try {
    window.close();
  } catch {
    /* ignore */
  }
}
