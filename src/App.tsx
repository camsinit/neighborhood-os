
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
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
import { NeighborhoodProvider } from "@/contexts/neighborhood";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  {/* Join routes moved outside ProtectedRoute to allow unauthenticated access */}
                  <Route path="/join/:inviteCode" element={<JoinPage />} />
                  <Route path="/join" element={<JoinPage />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
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
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
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
