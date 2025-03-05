
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import App from './App.tsx';
import './index.css';

/**
 * Main entry point for the application
 * 
 * This file sets up the React application with all necessary providers:
 * - BrowserRouter for navigation
 * - SessionContextProvider for Supabase auth
 * - QueryClientProvider for data fetching
 */

// Create a new React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Mount the application
createRoot(document.getElementById("root")!).render(
  // BrowserRouter enables routing functionality
  <BrowserRouter>
    {/* SessionContextProvider gives access to Supabase authentication */}
    <SessionContextProvider supabaseClient={supabase}>
      {/* QueryClientProvider enables React Query data fetching */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SessionContextProvider>
  </BrowserRouter>
);
