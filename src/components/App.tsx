
/**
 * Updated App component to use the new NeighborhoodProvider
 */
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "@/routes";
import { NeighborhoodProvider } from "@/components/neighborhood/NeighborhoodProvider";

/**
 * Main App component
 * 
 * This component sets up the application's providers and router.
 */
export default function App() {
  // Create a new query client for React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        retry: 1
      }
    }
  }));
  
  // Create router with our routes configuration
  const router = createBrowserRouter(routes);
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap the app with our new NeighborhoodProvider */}
      <NeighborhoodProvider>
        <RouterProvider router={router} />
        <Toaster />
      </NeighborhoodProvider>
    </QueryClientProvider>
  );
}
