import { supabase } from './supabase';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Initiates Google Sign-In using Supabase OAuth
 * Redirects to Google authentication and returns to /app upon success
 */
export async function signInWithGoogle(redirectTo = `${window.location.origin}/app`) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    throw err;
  }
}

/**
 * Checks and handles URL hash/search params after Google OAuth callback
 */
export async function handleGoogleCallback() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.error('[Google Callback Error]:', err);
    return null;
  }
}

export default {
  signInWithGoogle,
  handleGoogleCallback,
};
