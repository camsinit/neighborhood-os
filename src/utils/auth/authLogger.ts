import type { AuthChangeEvent, Session, AuthError } from "@supabase/supabase-js";

export const logAuthStateChange = (
  event: AuthChangeEvent, 
  session: Session | null
) => {
  console.log('Auth state changed:', {
    event,
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    timestamp: new Date().toISOString(),
    currentPath: window.location.pathname,
    accessToken: session?.access_token ? 'Present' : 'Missing',
    refreshToken: session?.refresh_token ? 'Present' : 'Missing',
    expiresAt: session?.expires_at
  });
};

export const logSignIn = (session: Session | null) => {
  console.log('Sign in successful:', {
    userId: session?.user?.id,
    email: session?.user?.email,
    aud: session?.user?.aud,
    lastSignInAt: session?.user?.last_sign_in_at,
    expiresIn: session?.expires_in,
    tokenDetails: {
      accessTokenPresent: !!session?.access_token,
      refreshTokenPresent: !!session?.refresh_token,
      expiresAt: session?.expires_at
    }
  });
};

export const logSessionCheck = (session: Session | null, error: AuthError | null) => {
  console.log('Session validation check:', {
    hasValidSession: !!session,
    sessionError: error?.message,
    timestamp: new Date().toISOString()
  });
};

export const logNewSignUp = (session: Session | null) => {
  console.log('New user signed up:', {
    userId: session?.user?.id,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });
};