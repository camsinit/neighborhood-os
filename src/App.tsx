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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth session at:', location.pathname);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error.message, error.status);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/landing');
          }
          return;
        }

        if (!mounted) return;

        console.log('Session check result:', {
          hasSession: !!session,
          currentPath: location.pathname
        });

        setIsAuthenticated(!!session);
        setIsLoading(false);

        if (!session) {
          if (location.pathname !== '/login' && location.pathname !== '/landing') {
            console.log('No session, redirecting to landing from:', location.pathname);
            navigate('/landing');
          }
        } else {
          console.log('Session exists, staying at:', location.pathname);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/landing');
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', {
        event,
        hasSession: !!session,
        currentPath: location.pathname
      });
      
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, navigating to dashboard');
        setIsLoading(false);
        navigate('/dashboard');
      } else if (!session && location.pathname !== '/login' && location.pathname !== '/landing') {
        console.log('No session after state change, redirecting to landing');
        setIsLoading(false);
        navigate('/landing');
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    console.log('Loading state at path:', location.pathname);
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/landing') {
    console.log('Not authenticated, preventing access to:', location.pathname);
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
            <Route path="/landing" element={<LandingPage />} />
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
            <Route
              path="/"
              element={
                <Navigate to="/dashboard" replace />
              }
            />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  </BrowserRouter>
);

export default App;