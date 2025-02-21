
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainContent from "./components/layout/MainContent";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import SafetyPage from "./pages/SafetyPage";
import CalendarPage from "./pages/CalendarPage";
import NeighborsPage from "./pages/NeighborsPage";
import NotificationsPage from "./pages/NotificationsPage";
import GoodsPage from "./pages/GoodsPage";
import CarePage from "./pages/CarePage";
import SkillsPage from "./pages/SkillsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainContent />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="neighbors" element={<NeighborsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="goods" element={<GoodsPage />} />
          <Route path="care" element={<CarePage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
