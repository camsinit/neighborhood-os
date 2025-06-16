
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
import { NeighborhoodProvider } from "@/contexts/neighborhood";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import SuperAdminRoute from "@/components/auth/SuperAdminRoute";
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
                  
                  {/* Join routes - allow unauthenticated access */}
                  <Route path="/join/:inviteCode" element={<JoinPage />} />
                  <Route path="/join" element={<JoinPage />} />
                  
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
                  
                  {/* Protected app routes */}
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <HomePage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <CalendarPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/skills"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SkillsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/goods"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <GoodsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/safety"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SafetyPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/neighbors"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <NeighborsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/modules"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <ModulesPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SettingsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/debug"
                    element={
                      <ProtectedRoute>
                        <SuperAdminRoute>
                          <MainLayout>
                            <DebugPage />
                          </MainLayout>
                        </SuperAdminRoute>
                      </ProtectedRoute>
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
