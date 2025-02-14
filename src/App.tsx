
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotificationsPage from "@/pages/NotificationsPage";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import SettingsDialog from "@/components/SettingsDialog";

const queryClient = new QueryClient();

const App = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex w-full">
                    <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
                    <div className="flex-1 bg-white">
                      <main>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/calendar" element={<CalendarPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/skills" element={<SkillsPage />} />
                          <Route path="/goods" element={<GoodsPage />} />
                          <Route path="/care" element={<CarePage />} />
                          <Route path="/safety" element={<SafetyPage />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
          <Sonner />
          <SettingsDialog 
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
