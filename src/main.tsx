
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import our refactored CSS files in the correct order
// First base styles with Tailwind base directive
import "./styles/base.css";
// Then component styles with Tailwind components directive
import "./styles/components.css";
// Then the rest of our styles
import "./styles/animations.css";
import "./styles/layout.css";
import "./styles/gradients.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default query options
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Add QueryClientProvider to provide React Query context */}
    <QueryClientProvider client={queryClient}>
      {/* Wrap the App component with BrowserRouter to provide routing context */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
