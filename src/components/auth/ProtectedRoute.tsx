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
        console.log('Starting auth check at:', location.pathname, {
          timestamp: new Date().toISOString(),
          currentUrl: window.location.href,
          referrer: document.referrer,
          navigationState: window.history.state
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
          provider: session?.user?.app_metadata?.provider
        });

        if (hasSession) {
          console.log('Valid session found:', {
            userId: session.user.id,
            email: session.user.email,
            aud: session.user.aud,
            role: session.user.role,
            lastSignInAt: session.user.last_sign_in_at,
            expiresAt: session.expires_at,
            currentPath: location.pathname,
            intendedPath: location.state?.from?.pathname
          });
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          console.log('No valid session found, redirecting from:', location.pathname, {
            timestamp: new Date().toISOString(),
            currentUrl: window.location.href,
            referrer: document.referrer
          });
          
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Save the current location to redirect back after login
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
        
        toast({
          title: "Authentication Check Failed",
          description: "An unexpected error occurred while checking your authentication status.",
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
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        console.log('Auth state change ignored - component unmounted');
        return;
      }

      console.log('Auth state changed:', {
        event,
        hasSession: !!session,
        currentPath: location.pathname,
        userId: session?.user?.id,
        email: session?.user?.email,
        timestamp: new Date().toISOString(),
        navigationState: window.history.state
      });

      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully:', {
          userId: session.user.id,
          email: session.user.email,
          aud: session.user.aud,
          role: session.user.role,
          lastSignInAt: session.user.last_sign_in_at,
          expiresAt: session.expires_at,
          currentPath: location.pathname,
          intendedPath: location.state?.from?.pathname
        });
        
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Check if there's a saved location to redirect back to
        const savedLocation = location.state?.from?.pathname;
        if (savedLocation && savedLocation !== '/login') {
          navigate(savedLocation, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session expired:', {
          event,
          timestamp: new Date().toISOString(),
          currentPath: location.pathname
        });
        
        setIsAuthenticated(false);
        setIsLoading(false);
        
        if (location.pathname !== '/login') {
          navigate('/login', { 
            replace: true,
            state: { from: location }
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed:', {
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
          currentPath: location.pathname
        });
      }
    });

    return () => {
      console.log('Cleaning up auth check effect', {
        pathname: location.pathname,
        timestamp: new Date().toISOString()
      });
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  if (isLoading) {
    console.log('Auth check loading at path:', location.pathname, {
      timestamp: new Date().toISOString(),
      state: window.history.state
    });
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    console.log('Access denied - not authenticated at path:', location.pathname, {
      timestamp: new Date().toISOString(),
      state: window.history.state
    });
    return null;
  }

  console.log('Rendering protected content at:', location.pathname, {
    timestamp: new Date().toISOString(),
    state: window.history.state
  });
  return <>{children}</>;
};

export default ProtectedRoute;