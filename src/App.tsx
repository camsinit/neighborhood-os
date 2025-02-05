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
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          throw error;
        }

        console.log('Session status:', session ? 'Active' : 'None');
        setIsAuthenticated(!!session);
        
        if (!session && location.pathname !== '/login' && location.pathname !== '/landing') {
          console.log('No session, redirecting to landing page');
          navigate('/landing', { replace: true });
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/landing', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session && location.pathname !== '/login' && location.pathname !== '/landing') {
        navigate('/landing', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    console.log('Still loading authentication status...');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/landing') {
    console.log('Not authenticated, rendering null');
    return null;
  }

  console.log('Rendering protected content');
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
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  </BrowserRouter>
);

export default App;