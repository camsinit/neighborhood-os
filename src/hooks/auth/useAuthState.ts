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
            return;
          }

          console.log('Session validated successfully, checking profile...', {
            userId: session?.user?.id,
            timestamp: new Date().toISOString()
          });

          // Check profile
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session?.user?.id)
              .single();

            console.log('Profile check result:', {
              hasProfile: !!profile,
              profileData: profile,
              error: profileError,
              timestamp: new Date().toISOString()
            });

            if (profileError) {
              console.error('Profile fetch error:', {
                error: profileError,
                message: profileError.message,
                details: profileError.details,
                timestamp: new Date().toISOString()
              });
              toast({
                title: "Profile Error",
                description: `Error fetching profile: ${profileError.message}`,
                variant: "destructive",
              });
              return;
            }

            // If this is a new signup (profile just created)
            if (event === 'SIGNED_UP' as AuthChangeEvent) {
              logNewSignUp(session);
              setShowOnboarding(true);
              console.log('New signup detected, showing onboarding');
            }

          } catch (error) {
            console.error('Unexpected error during profile check:', {
              error,
              timestamp: new Date().toISOString()
            });
            toast({
              title: "Error",
              description: "An unexpected error occurred while checking your profile",
              variant: "destructive",
            });
          }
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