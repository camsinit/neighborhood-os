import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  logAuthStateChange, 
  logSignIn, 
  logSessionCheck, 
  logNewSignUp 
} from "@/utils/auth/authLogger";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const useAuthState = (redirectTo: string) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Auth state management initialized', {
      redirectTo,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });

        logAuthStateChange(event, session);

        if (event === 'SIGNED_IN') {
          logSignIn(session);
          console.log('Sign in detected, checking session...');

          // Check if session is actually valid
          const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
          logSessionCheck(sessionCheck.session, sessionError);

          if (sessionError) {
            console.error('Session validation failed:', {
              error: sessionError,
              message: sessionError.message,
              details: sessionError.stack,
              timestamp: new Date().toISOString()
            });
            toast({
              title: "Authentication Error",
              description: `Session validation failed: ${sessionError.message}`,
              variant: "destructive",
            });
          } else {
            console.log('Session validated successfully:', {
              userId: sessionCheck.session?.user?.id,
              timestamp: new Date().toISOString()
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'USER_UPDATED') {
          console.log('User profile updated');
        }

        if (event === 'SIGNED_UP' as AuthChangeEvent) {
          logNewSignUp(session);
          setShowOnboarding(true);
        }
      }
    );

    // Test auth state on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message,
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      });

      if (error) {
        console.error('Session check error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Session Check Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    return () => {
      console.log('Auth state management cleanup');
      subscription.unsubscribe();
    };
  }, [toast, redirectTo]);

  return {
    showOnboarding,
    setShowOnboarding,
    showSurvey,
    setShowSurvey
  };
};