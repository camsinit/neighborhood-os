
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import App from './App.tsx';
import './index.css';

// Import the Supabase client from the integrations directory
// This is our single source of truth for the Supabase client instance
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a new QueryClient instance
 * This configures how React Query will behave throughout the application
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set default staleTime to reduce unnecessary refetches
      staleTime: 60 * 1000, // 1 minute
      // Retry failed queries 2 times before showing an error
      retry: 2,
    },
  },
});

// Create root and render the app with all required providers
createRoot(document.getElementById("root")!).render(
  // SessionContextProvider gives access to the Supabase authentication context
  <SessionContextProvider supabaseClient={supabase}>
    {/* QueryClientProvider gives access to the queryClient throughout the app */}
    <QueryClientProvider client={queryClient}>
      {/* No BrowserRouter here - it's now only in App.tsx */}
      <App />
    </QueryClientProvider>
  </SessionContextProvider>
);
