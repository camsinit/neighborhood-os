
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

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
  /* 
   * We've removed the SessionContextProvider from here to avoid the nested router issue.
   * It's now moved to App.tsx to ensure we have only one Router in the app.
   */
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
