
import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'; 
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

    // Clean up subscription when component unmounts
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
          {/* IMPORTANT: Only ONE Router component in the entire app */}
          <Router>
            <Routes>
              {/* Public routes */}
              {/* Root route displays landing page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Authentication route - single instance */}
              <Route path="/login" element={<Login />} />
              
              {/* Join routes - single instance with optional parameter */}
              <Route path="/join/:inviteCode?" element={<JoinPage />} />
              
              {/* Route for determining navigation based on auth state */}
              <Route path="/index" element={<Index />} />
              
              {/* Protected routes with MainLayout - this is the key fix */}
              <Route 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      {/* The Outlet component will render the matching child route */}
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }
              >
                {/* All these routes will be rendered inside the MainLayout via the Outlet */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/neighbors" element={<NeighborsPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/goods" element={<GoodsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                {/* Admin routes */}
                <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
              </Route>

              {/* Redirect /dashboard to /home for backward compatibility */}
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              
              {/* Catch-all route - redirect to landing page */}
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
