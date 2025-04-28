
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import HomePage from "@/pages/HomePage";
import SkillsPage from "@/pages/SkillsPage";
import FreebiesPage from "@/pages/FreebiesPage"; // Renamed from GoodsPage to FreebiesPage
import CalendarPage from "@/pages/CalendarPage";
import SafetyPage from "@/pages/SafetyPage";
import NeighborsPage from "@/pages/NeighborsPage";

// Layout
import AppLayout from "./components/layout/MainLayout"; // Using MainLayout instead

import { Toaster } from "sonner";
// Removing imports for files that don't exist

function App() {
  return (
    <main className="app">
      <Routes>
        {/* Removed routes for files that don't exist */}

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/freebies" element={<FreebiesPage />} /> {/* Updated route path from /goods to /freebies */}
          
          {/* Add a redirect from the old /goods path to the new /freebies path */}
          <Route path="/goods" element={<Navigate to="/freebies" replace />} />
          
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/neighbors" element={<NeighborsPage />} />
        </Route>

        {/* Removed not found route since the file doesn't exist */}
      </Routes>
      <Toaster position="top-center" richColors />
    </main>
  );
}

export default App;
