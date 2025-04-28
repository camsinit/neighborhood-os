
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
// Removing the paths that are causing errors since these files don't exist
// and we're not supposed to create them based on the read-only files list

function App() {
  return (
    <main className="app">
      <Routes>
        {/* Removed the AuthLayout routes since those files don't exist */}

        {/* Removed the OnboardingPage route since that file doesn't exist */}

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/freebies" element={<FreebiesPage />} /> {/* Updated route path from /goods to /freebies */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/neighbors" element={<NeighborsPage />} />
        </Route>

        {/* Removed the NotFoundPage route since that file doesn't exist */}
      </Routes>
      <Toaster position="top-center" richColors />
    </main>
  );
}

export default App;
