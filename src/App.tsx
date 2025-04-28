
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import SkillsPage from "@/pages/SkillsPage";
import FreebiesPage from "@/pages/FreebiesPage"; // Updated from GoodsPage to FreebiesPage
import CalendarPage from "@/pages/CalendarPage";
import SafetyPage from "@/pages/SafetyPage";
import NeighborsPage from "@/pages/NeighborsPage";
import AppLayout from "@/components/layout/AppLayout";

import { Toaster } from "sonner";
import AuthLayout from "./components/auth/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <main className="app">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/freebies" element={<FreebiesPage />} /> {/* Updated route path from /goods to /freebies */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/neighbors" element={<NeighborsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </main>
  );
}

export default App;
