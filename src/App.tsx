
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import JoinPage from "./pages/JoinPage";
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import SkillsPage from "./pages/SkillsPage";
import GoodsPage from "./pages/GoodsPage";
import SafetyPage from "./pages/SafetyPage";
import NeighborsPage from "./pages/NeighborsPage";
import ModulesPage from "./pages/ModulesPage";
import DebugPage from "./pages/DebugPage";
import SharePage from "./pages/SharePage";
import AdminPage from "./pages/AdminPage";
import { NeighborhoodProvider } from "@/contexts/neighborhood";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NeighborhoodAwareProtectedRoute from "@/components/auth/NeighborhoodAwareProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import SuperAdminRoute from "@/components/auth/SuperAdminRoute";
import AuthCallback from "@/pages/AuthCallback";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Limit retries to prevent infinite loops
        if (failureCount >= 3) return false;
        
        // Don't retry on certain error types
        if (error instanceof Error) {
          if (error.message.includes('CORS') || 
              error.message.includes('blocked') ||
              error.message.includes('Network')) {
            return false;
          }
        }
        
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <NeighborhoodProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  {/* Public routes - accessible without authentication */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Join routes - allow unauthenticated access */}
                  <Route path="/join/:inviteCode" element={<JoinPage />} />
                  <Route path="/join" element={<JoinPage />} />
                  
                  {/* Share routes - allow unauthenticated access */}
                  <Route path="/share/:shareCode" element={<SharePage />} />
                  
                  {/* Onboarding - special handling for guest mode */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Dashboard entry point - handles authenticated user routing */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* All routes now use neighborhood-aware routing */}
                  
                  {/* Neighborhood-specific routes */}
                  <Route
                    path="/n/:neighborhoodId/calendar"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <CalendarPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/skills"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <SkillsPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/goods"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <GoodsPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/safety"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <SafetyPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/neighbors"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <NeighborsPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/modules"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <ModulesPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/settings"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <SettingsPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  <Route
                    path="/n/:neighborhoodId/admin"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <AdminPage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  
                  {/* Neighborhood-specific routes with MainLayout */}
                  <Route
                    path="/n/:neighborhoodId/home"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <MainLayout>
                          <HomePage />
                        </MainLayout>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                  
                  {/* Debug route - Super Admin only */}
                  <Route
                    path="/n/:neighborhoodId/debug"
                    element={
                      <NeighborhoodAwareProtectedRoute>
                        <SuperAdminRoute>
                          <MainLayout>
                            <DebugPage />
                          </MainLayout>
                        </SuperAdminRoute>
                      </NeighborhoodAwareProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NeighborhoodProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
