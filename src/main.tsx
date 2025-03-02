
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Create a new QueryClient instance
// This is required for all components that use React Query hooks like useQuery
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

// Create root and render the app wrapped in BrowserRouter and QueryClientProvider
// This enables routing functionality throughout the application
// And allows all components to use React Query hooks
createRoot(document.getElementById("root")!).render(
  // QueryClientProvider gives access to the queryClient throughout the app
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
