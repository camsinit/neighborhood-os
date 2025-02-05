import { AuthError, Session } from "@supabase/supabase-js";
import { Location } from "react-router-dom";

export const logAuthCheck = () => {
  console.log('Environment details:', {
    nodeEnv: import.meta.env.MODE,
    baseUrl: window.location.origin,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString(),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });
};

export const logAuthError = (error: AuthError, location: Location) => {
  console.error('Auth check error:', {
    message: error.message,
    status: error.status,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    location: location.pathname
  });
};

export const logAuthStateChange = (event: string, session: Session | null) => {
  console.log('Auth state changed:', {
    event,
    hasSession: !!session,
    currentPath: window.location.pathname,
    userId: session?.user?.id,
    email: session?.user?.email,
    timestamp: new Date().toISOString(),
    navigationState: window.history.state,
    sessionData: {
      role: session?.user?.role,
      authProvider: session?.user?.app_metadata?.provider,
      lastSignInAt: session?.user?.last_sign_in_at,
    }
  });
};