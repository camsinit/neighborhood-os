
// Import necessary dependencies
import { Routes, Route } from "react-router-dom"; 
import { SupabaseProvider } from "./providers/SupabaseProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/MainContent";
import NeighborsPage from "@/pages/NeighborsPage";
import SettingsPage from "@/pages/SettingsPage";
import JoinPage from "@/pages/JoinPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage"; // New import for dashboard

/**
 * App Component
 * 
 * This is the root component of our application.
 * It sets up the routing structure.
 * Note: The BrowserRouter and QueryClientProvider are now in main.tsx
 */
function App() {
  return (
    <div className="App">
      {/* SupabaseProvider is an additional wrapper specific to our app */}
      <SupabaseProvider>
        <div className="absolute top-0 right-0 left-0 bottom-0 flex flex-col">
          <Routes>
            <Route
              path="/"
              element={<Index />}
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/join/:inviteCode"
              element={<JoinPage />}
            />
            <Route
              path="/onboarding"
              element={<OnboardingPage />}
            />
            {/* Add the dashboard route */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            {/* Protected routes requiring auth */}
            <Route
              path="/"
              element={<ProtectedRoute><Layout /></ProtectedRoute>}
            >
              <Route path="/neighbors" element={<NeighborsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </div>
        <Toaster />
      </SupabaseProvider>
    </div>
  );
}

export default App;
