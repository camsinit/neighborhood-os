import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Settings from "./pages/Settings";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./components/ui/loading";
import { useToast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Starting auth check at:', location.pathname);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error.message, error.stack);
          toast({
            title: "Authentication Error",
            description: error.message,
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
        });

        if (hasSession) {
          console.log('Valid session found:', {
            userId: session.user.id,
            email: session.user.email,
            aud: session.user.aud,
            role: session.user.role,
          });
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          console.log('No valid session found, redirecting from:', location.pathname);
          setIsAuthenticated(false);
          setIsLoading(false);
          if (location.pathname !== '/login') {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Unexpected auth check error:', error);
        toast({
          title: "Authentication Check Failed",
          description: "An unexpected error occurred while checking your authentication status.",
          variant: "destructive",
        });
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/', { replace: true });
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
      });

      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully:', {
          userId: session.user.id,
          email: session.user.email,
          aud: session.user.aud,
          role: session.user.role,
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        navigate('/dashboard', { replace: true });
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session expired');
        setIsAuthenticated(false);
        setIsLoading(false);
        if (location.pathname !== '/login') {
          navigate('/', { replace: true });
        }
      }
    });

    return () => {
      console.log('Cleaning up auth check effect');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    console.log('Auth check loading at path:', location.pathname);
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    console.log('Access denied - not authenticated at path:', location.pathname);
    return null;
  }

  console.log('Rendering protected content at:', location.pathname);
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            {/* Redirect /landing to root */}
            <Route path="/landing" element={<Navigate to="/" replace />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  </BrowserRouter>
);

export default App;