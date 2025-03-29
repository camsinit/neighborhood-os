
import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Create a client (reduced comments for simplicity)
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
 * 3. Defines all application routes
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
      
      console.log("[Supabase Client] Initial auth check:", {
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
      
      console.log("[Supabase Client] Auth state changed:", {
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
              {/* Public routes - fixed duplicated routes issue */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<JoinPage />} />
              
              {/* Dashboard route - will redirect to /home if authenticated */}
              <Route path="/dashboard" element={
                session ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
              } />

              {/* Index route now properly redirects based on auth state */}
              <Route path="/index" element={<Index />} />

              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/neighbors" element={<ProtectedRoute><NeighborsPage /></ProtectedRoute>} />
              <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
              <Route path="/goods" element={<ProtectedRoute><GoodsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute><SafetyPage /></ProtectedRoute>} />
              <Route path="/care" element={<ProtectedRoute><CarePage /></ProtectedRoute>} />
              <Route path="/admin/waitlist" element={<ProtectedRoute><WaitlistAdmin /></ProtectedRoute>} />

              {/* Catch-all route redirects to landing page for better UX */}
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
