
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

  // Set up auth state change listener when the app loads
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Provide session context and neighborhood context to the app
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
