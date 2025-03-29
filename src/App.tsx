import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { NeighborhoodProvider } from './contexts/neighborhood';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import HomePage from './pages/HomePage';
import NeighborsPage from './pages/NeighborsPage';
import SkillsPage from './pages/SkillsPage';
import GoodsPage from './pages/GoodsPage';
import CalendarPage from './pages/CalendarPage';
import SafetyPage from './pages/SafetyPage';
import CarePage from './pages/CarePage';
import JoinPage from './pages/JoinPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import WaitlistAdmin from './pages/WaitlistAdmin';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

/**
 * Create a Query Client with conservative settings
 * 
 * Using shorter staleTime and fewer retries to avoid request storms
 * when there are issues with permissions or database access
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce retries to prevent hammering the server with failing requests
      retry: 1,
      // Keep cached data for 1 minute only to ensure freshness
      staleTime: 1 * 60 * 1000,
      // Add better error handling
      onError: (error) => {
        console.error("[QueryClient] Request failed:", error);
      }
    },
  },
});

/**
 * Main Application Component
 * 
 * This component handles:
 * 1. Basic authentication state setup
 * 2. Providing context providers 
 * 3. Defining routes
 * 
 * Simplified to reduce startup complexity
 */
function App() {
  // Track session state
  const [session, setSession] = useState<Session | null>(null);

  // Set up minimal auth state listener
  useEffect(() => {
    console.log("[App] Setting up auth state listener");
    
    // Initial session check - keep this simple
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("[App] Initial auth check:", {
        hasSession: !!session,
        userId: session?.user?.id
      });
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[App] Auth state changed:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      });
      setSession(session);
    });

    // Clean up subscription
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <NeighborhoodProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<JoinPage />} />

              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/neighbors" element={<ProtectedRoute><NeighborsPage /></ProtectedRoute>} />
              <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
              <Route path="/goods" element={<ProtectedRoute><GoodsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute><SafetyPage /></ProtectedRoute>} />
              <Route path="/care" element={<ProtectedRoute><CarePage /></ProtectedRoute>} />
              <Route path="/admin/waitlist" element={<ProtectedRoute><WaitlistAdmin /></ProtectedRoute>} />

              {/* Default to Index */}
              <Route path="*" element={<Index />} />
            </Routes>
            <Toaster position="top-center" />
          </Router>
        </NeighborhoodProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
}

export default App;
