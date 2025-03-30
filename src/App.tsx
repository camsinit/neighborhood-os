
import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NeighborhoodProvider } from './contexts/neighborhood';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import JoinPage from './pages/JoinPage';
import Index from './pages/Index';

// Import protected pages
import HomePage from './pages/HomePage';
import NeighborsPage from './pages/NeighborsPage';
import SkillsPage from './pages/SkillsPage';
import GoodsPage from './pages/GoodsPage';
import CalendarPage from './pages/CalendarPage';
import SafetyPage from './pages/SafetyPage';
import CarePage from './pages/CarePage';
import WaitlistAdmin from './pages/WaitlistAdmin';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

/**
 * Create a client for React Query
 * - Sets retry attempts to 2 for failed requests
 * - Sets stale time to 5 minutes to reduce unnecessary refetches
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Main Application Component
 * 
 * This component:
 * 1. Sets up authentication state tracking
 * 2. Provides the NeighborhoodProvider context
 * 3. Defines all application routes with a streamlined hierarchy
 */
function App() {
  // Track the user's authentication session
  const [session, setSession] = useState<Session | null>(null);
  // Track if the initial auth check is complete
  const [authInitialized, setAuthInitialized] = useState(false);

  // Set up auth state change listener when the app loads
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Mark auth as initialized after getting the initial session
      setAuthInitialized(true);
      
      console.log("[App] Initial auth check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      console.log("[App] Auth state changed:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing during initial auth check to prevent flashing content
  if (!authInitialized) {
    return null;
  }

  // Provide session context and neighborhood context to the app
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        <NeighborhoodProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              {/* Root route always displays landing page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Authentication route */}
              <Route path="/login" element={<Login />} />
              
              {/* Join routes - using a single route with optional parameter */}
              <Route path="/join/:inviteCode?" element={<JoinPage />} />
              
              {/* Route used for determining where to navigate based on auth state */}
              <Route path="/index" element={<Index />} />
              
              {/* Protected routes - all using the main layout with sidebar */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/neighbors" element={<NeighborsPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/goods" element={<GoodsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/care" element={<CarePage />} />
                <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
                
                {/* Redirect old dashboard route to /home */}
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              </Route>

              {/* Redirect any unmatched routes to the landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-center" />
          </Router>
        </NeighborhoodProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
