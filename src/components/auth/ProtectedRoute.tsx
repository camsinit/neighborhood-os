import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Log environment info
        console.log('Environment details:', {
          nodeEnv: import.meta.env.MODE,
          baseUrl: window.location.origin,
          currentPath: window.location.pathname,
          timestamp: new Date().toISOString(),
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });

        console.log('Starting auth check at:', location.pathname, {
          timestamp: new Date().toISOString(),
          currentUrl: window.location.href,
          referrer: document.referrer,
          navigationState: window.history.state,
          locationState: location.state,
          cookies: document.cookie,
          localStorage: {
            hasSupabaseSession: !!localStorage.getItem('supabase.auth.token'),
            hasCustomSession: !!localStorage.getItem('session')
          }
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', {
            message: error.message,
            status: error.status,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            location: location.pathname
          });
          
          toast({
            title: "Authentication Error",
            description: `Error checking session: ${error.message}`,
            variant: "destructive",
          });
          
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/login', { 
              replace: true,
              state: { from: location }
            });
          }
          return;
        }

        if (!mounted) {
          console.log('Component unmounted during auth check');
          return;
        }

        const hasSession = !!session;
        console.log('Auth check results:', {
          hasSession,
          currentPath: location.pathname,
          userId: session?.user?.id,
          email: session?.user?.email,
          lastSignInAt: session?.user?.last_sign_in_at,
          timestamp: new Date().toISOString(),
          accessToken: session?.access_token ? 'Present' : 'Missing',
          refreshToken: session?.refresh_token ? 'Present' : 'Missing',
          expiresAt: session?.expires_at,
          provider: session?.user?.app_metadata?.provider,
          intendedPath: location.state?.from?.pathname || '/dashboard',
          sessionData: {
            role: session?.user?.role,
            authProvider: session?.user?.app_metadata?.provider,
            lastSignInAt: session?.user?.last_sign_in_at,
          }
        });

        if (hasSession) {
          setIsAuthenticated(true);
          setIsLoading(false);
          
          // If we have a saved location, navigate there
          const savedLocation = location.state?.from?.pathname;
          if (savedLocation && savedLocation !== '/login') {
            console.log('Navigating to saved location:', {
              savedLocation,
              currentPath: location.pathname,
              timestamp: new Date().toISOString()
            });
            navigate(savedLocation, { replace: true });
          }
        } else {
          console.log('No valid session found, redirecting from:', {
            currentPath: location.pathname,
            timestamp: new Date().toISOString(),
            redirectTo: '/login',
            state: { from: location }
          });
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/login', { 
            replace: true,
            state: { from: location }
          });
        }
      } catch (error) {
        console.error('Unexpected auth check error:', {
          error,
          timestamp: new Date().toISOString(),
          location: location.pathname,
          stack: error instanceof Error ? error.stack : undefined
        });
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/login', { 
            replace: true,
            state: { from: location }
          });
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', {
        event,
        hasSession: !!session,
        currentPath: location.pathname,
        userId: session?.user?.id,
        email: session?.user?.email,
        timestamp: new Date().toISOString(),
        navigationState: window.history.state,
        locationState: location.state
      });

      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Check if there's a saved location to redirect back to
        const savedLocation = location.state?.from?.pathname;
        if (savedLocation && savedLocation !== '/login') {
          console.log('Redirecting after sign in:', {
            to: savedLocation,
            from: location.pathname,
            timestamp: new Date().toISOString()
          });
          navigate(savedLocation, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session expired:', {
          event,
          currentPath: location.pathname,
          timestamp: new Date().toISOString()
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;