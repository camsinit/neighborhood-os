
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/LoginPage";
import NeighborsPage from "@/pages/NeighborsPage";
import CalendarPage from "@/pages/CalendarPage";
import SafetyPage from "@/pages/SafetyPage";
import CarePage from "@/pages/CarePage";
import SkillsPage from "@/pages/SkillsPage";
import GoodsPage from "@/pages/GoodsPage";
import AdminPage from "@/pages/AdminPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import JoinPage from "@/pages/JoinPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <div className="app min-h-screen">
      <Toaster />
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
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
