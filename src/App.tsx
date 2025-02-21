
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home, Bell, Calendar, Heart, Gift, Brain, Shield, Settings, Users } from "lucide-react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { 
  Sidebar, 
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "./components/ui/sidebar";
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

// Define navigation items
const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Shield, label: "Safety", path: "/safety" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Users, label: "Neighbors", path: "/neighbors" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Gift, label: "Goods", path: "/goods" },
  { icon: Heart, label: "Care", path: "/care" },
  { icon: Brain, label: "Skills", path: "/skills" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

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
                    <SidebarContent>
                      <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {navigationItems.map((item) => (
                              <SidebarMenuItem key={item.path}>
                                <SidebarMenuButton asChild>
                                  <Link to={item.path}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
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
