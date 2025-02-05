import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLoginState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    console.log('Starting profile fetch for user:', userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Profile fetch result:', {
      hasProfile: !!profile,
      profileData: profile,
      error,
      timestamp: new Date().toISOString(),
      userId
    });

    if (error) {
      throw error;
    }

    return profile;
  };

  const handleNavigation = async () => {
    console.log('Starting navigation to root', {
      currentPath: window.location.pathname,
      navigationState: window.history.state
    });

    try {
      navigate("/", { 
        replace: true,
        state: { from: 'login', timestamp: new Date().toISOString() }
      });
      console.log('Navigation completed successfully', {
        timestamp: new Date().toISOString(),
        to: '/',
        navigationState: window.history.state
      });
    } catch (navError) {
      console.error('Navigation failed:', {
        error: navError,
        timestamp: new Date().toISOString(),
        attempted_path: '/',
        stack: navError instanceof Error ? navError.stack : undefined
      });
      throw navError;
    }
  };

  useEffect(() => {
    console.log('Login state management initialized', {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      href: window.location.href
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change in Login page:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
        currentLocation: window.location.pathname,
        navigationState: window.history.state,
        sessionDetails: session ? {
          expiresAt: session.expires_at,
          provider: session.user?.app_metadata?.provider,
          lastSignIn: session.user?.last_sign_in_at,
          email: session.user?.email
        } : null
      });

      if (event === 'SIGNED_IN' && session) {
        try {
          await fetchProfile(session.user.id);
          await handleNavigation();
        } catch (error) {
          console.error('Error in auth flow:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          });
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "An unexpected error occurred",
            variant: "destructive",
          });
        }
      }
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check in Login page:', {
        hasSession: !!session,
        error: error?.message,
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname,
        sessionDetails: session ? {
          expiresAt: session.expires_at,
          provider: session.user?.app_metadata?.provider,
          lastSignIn: session.user?.last_sign_in_at,
          email: session.user?.email
        } : null
      });

      if (session) {
        console.log('Session found, navigating to root');
        navigate("/");
      }
    });

    return () => {
      console.log('Login state management cleanup', {
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname
      });
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
};