
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import CalendarPage from "@/pages/CalendarPage";
import SkillsPage from "@/pages/SkillsPage";
import GoodsPage from "@/pages/GoodsPage";
import CarePage from "@/pages/CarePage";
import SafetyPage from "@/pages/SafetyPage";
import NeighborsPage from "@/pages/NeighborsPage";
import Login from "@/pages/Login";
import JoinPage from "@/pages/JoinPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import SettingsDialog from "@/components/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { NeighborhoodProvider } from "@/contexts/NeighborhoodContext";
import LandingPage from "@/pages/LandingPage";
import WaitlistAdmin from "@/pages/WaitlistAdmin";

// Create a new query client for React Query
const queryClient = new QueryClient();

// Layout component for authenticated pages with sidebar
const Layout = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <div className="flex-1 bg-white">
        <main>
          <Outlet />
        </main>
      </div>
      <SettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

// Simple admin layout component that doesn't include the sidebar
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  // State to track initial authentication loading
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[App] Initializing authentication...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[App] Error getting session:", error);
        } else {
          console.log("[App] Initial session state:", { 
            hasSession: !!session,
            userId: session?.user?.id 
          });
        }
      } catch (error) {
        console.error("[App] Unexpected error during initialization:", error);
      } finally {
        console.log("[App] Initialization complete");
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (isInitializing) {
    console.log("[App] Showing loading state while initializing");
    return <LoadingSpinner />;
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <NeighborhoodProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Routes>
                {/* Landing page as the root route */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join/:inviteCode" element={<JoinPage />} />
                
                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="waitlist" element={<WaitlistAdmin />} />
                </Route>
                
                {/* Add redirects for direct page access */}
                <Route path="/goods" element={<Navigate to="/dashboard/goods" replace />} />
                <Route path="/skills" element={<Navigate to="/dashboard/skills" replace />} />
                <Route path="/calendar" element={<Navigate to="/dashboard/calendar" replace />} />
                <Route path="/care" element={<Navigate to="/dashboard/care" replace />} />
                <Route path="/safety" element={<Navigate to="/dashboard/safety" replace />} />
                <Route path="/neighbors" element={<Navigate to="/dashboard/neighbors" replace />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<HomePage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="skills" element={<SkillsPage />} />
                  <Route path="goods" element={<GoodsPage />} />
                  <Route path="care" element={<CarePage />} />
                  <Route path="safety" element={<SafetyPage />} />
                  <Route path="neighbors" element={<NeighborsPage />} />
                </Route>
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </NeighborhoodProvider>
    </SessionContextProvider>
  );
};

export default App;
