
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import SettingsDialog from "@/components/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const queryClient = new QueryClient();

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

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);

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

  if (isInitializing) {
    console.log("[App] Showing loading state while initializing");
    return <LoadingSpinner />;
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
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
    </SessionContextProvider>
  );
};

export default App;
