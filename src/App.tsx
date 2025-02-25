
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/pages/Login";
import { HomePage } from "@/pages/HomePage";
import { SafetyPage } from "@/pages/SafetyPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { CarePage } from "@/pages/CarePage";
import { SkillsPage } from "@/pages/SkillsPage";
import { GoodsPage } from "@/pages/GoodsPage";
import { NeighborsPage } from "@/pages/NeighborsPage";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
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
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
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
            <Route
              path="/neighbors"
              element={
                <ProtectedRoute>
                  <NeighborsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
