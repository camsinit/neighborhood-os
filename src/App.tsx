
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
import { checkAuthState } from './utils/authStateCheck';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Create a client
// We're actually not using this one now - we're using the one from main.tsx
// But we'll keep it for now to avoid breaking existing code
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries up to 2 times
      retry: 2,
      // Keep cached data for 5 minutes
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

  // Set up auth state change listener when the app loads
  useEffect(() => {
    console.info("[App] Setting up auth state change listener");
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.info("[App] Initial session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      // If we have a session, run a diagnostic check
      if (session) {
        checkAuthState().then(state => {
          console.info("[App] Auth diagnostic check:", state);
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.info("[App] Auth state changed:", {
        event: _event,
        sessionExists: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      setSession(session);
      
      // Run diagnostic check on auth changes
      if (session) {
        checkAuthState().then(state => {
          console.info("[App] Auth state change diagnostic:", state);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Moved SessionContextProvider here from main.tsx and wrapped it around Router
  // This ensures we don't have nested Router components
  return (
    <SessionContextProvider supabaseClient={supabase}>
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
    </SessionContextProvider>
  );
}

export default App;
