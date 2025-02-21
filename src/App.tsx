
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Sidebar, SidebarProvider } from "./components/ui/sidebar";
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
              <SidebarProvider>
                {/* Important: wrapper div needs w-full to avoid layout issues */}
                <div className="flex min-h-screen w-full">
                  <Sidebar>
                    {/* Sidebar content will go here */}
                  </Sidebar>
                  <main className="flex-1">
                    <Routes>
                      <Route index element={<HomePage />} />
                      <Route path="safety" element={<SafetyPage />} />
                      <Route path="calendar" element={<CalendarPage />} />
                      <Route path="neighbors" element={<NeighborsPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="goods" element={<GoodsPage />} />
                      <Route path="care" element={<CarePage />} />
                      <Route path="skills" element={<SkillsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </main>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          }
        >
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
