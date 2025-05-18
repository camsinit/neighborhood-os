
import { useEffect, useState } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { NeighborhoodProvider } from './contexts/neighborhood';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import createAppRouter from './routes'; // Import the router function

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
 * 3. Creates and provides the router via RouterProvider
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

  // Create the router using our router configuration
  const router = createAppRouter();

  // Provide session context and neighborhood context to the app
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        <NeighborhoodProvider>
          {/* Use RouterProvider with our router configuration */}
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </NeighborhoodProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
