
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import CalendarPage from "@/pages/CalendarPage";
import SkillsPage from "@/pages/SkillsPage";
import GoodsPage from "@/pages/GoodsPage";
import CarePage from "@/pages/CarePage";
import SafetyPage from "@/pages/SafetyPage";
import SettingsDialog from "@/components/SettingsDialog";
import Sidebar from "@/components/layout/Sidebar";

const queryClient = new QueryClient();

const App = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex w-full">
            <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
            <div className="flex-1">
              <main>
                <Routes>
                  <Route path="/" element={<Navigate to="/calendar" replace />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/goods" element={<GoodsPage />} />
                  <Route path="/care" element={<CarePage />} />
                  <Route path="/safety" element={<SafetyPage />} />
                </Routes>
              </main>
            </div>
          </div>
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
