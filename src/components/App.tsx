
/**
 * Updated App component 
 */
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removed the problematic import for @/routes
import { NeighborhoodProvider } from "@/components/neighborhood/NeighborhoodProvider";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import NeighborsPage from "@/pages/NeighborsPage";
import CalendarPage from "@/pages/CalendarPage";
import SafetyPage from "@/pages/SafetyPage";
import CarePage from "@/pages/CarePage";
import SkillsPage from "@/pages/SkillsPage";
import GoodsPage from "@/pages/GoodsPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import JoinPage from "@/pages/JoinPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import WaitlistAdmin from "@/pages/WaitlistAdmin";

/**
 * Main App component
 * 
 * This component sets up the application's providers and router.
 * It creates the routes structure directly instead of importing from a routes file.
 */
export default function App() {
  // Create a new query client for React Query
  // This helps manage data fetching and caching throughout the app
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        retry: 1
      }
    }
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap the app with our NeighborhoodProvider */}
      <NeighborhoodProvider>
        <BrowserRouter>
          <div className="app min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join/:inviteCode" element={<JoinPage />} />
              <Route path="/onboarding/:inviteCode" element={<OnboardingPage />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/neighbors"
                element={
                  <ProtectedRoute>
                    <NeighborsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/safety"
                element={
                  <ProtectedRoute>
                    <SafetyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/care"
                element={
                  <ProtectedRoute>
                    <CarePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <ProtectedRoute>
                    <SkillsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goods"
                element={
                  <ProtectedRoute>
                    <GoodsPage />
                  </ProtectedRoute>
                }
              />
              {/* Admin route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <WaitlistAdmin />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </NeighborhoodProvider>
    </QueryClientProvider>
  );
}
