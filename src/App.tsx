
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import JoinPage from "./pages/JoinPage";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MainContent from "./components/layout/MainContent";
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import SafetyPage from "./pages/SafetyPage";
import CarePage from "./pages/CarePage";
import GoodsPage from "./pages/GoodsPage";
import SkillsPage from "./pages/SkillsPage";
import NeighborsPage from "./pages/NeighborsPage";
import LandingPage from "./pages/LandingPage";
import WaitlistAdmin from "./pages/WaitlistAdmin";

/**
 * Main App component
 * 
 * Handles routing, authentication protection, and application layout.
 * Includes routes for public pages and protected dashboard routes.
 */
function App() {
  // Get the current user session and Supabase client
  const session = useSession();
  const supabase = useSupabaseClient();
  
  // State to track authentication checking status
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Added state for settings dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle opening settings dialog
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    console.log("Opening settings dialog");
  };

  // Check authentication status when the component mounts
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      // You can add any additional auth checks here if needed
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [session, supabase]);

  // Component to protect routes that require authentication
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // If no session and not checking auth, redirect to login
    if (!session && !isCheckingAuth) {
      console.log("No authenticated session, redirecting to login page");
      return <Navigate to="/login" replace />;
    }

    // If authenticated or still checking, render the children
    return <>{children}</>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join/:inviteCode?" element={<JoinPage />} />
        
        <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
        
        {/* Protected dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Header onOpenSettings={handleOpenSettings} />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar onOpenSettings={handleOpenSettings} />
                <MainContent />
              </div>
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="events" element={<CalendarPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="care" element={<CarePage />} />
          <Route path="goods" element={<GoodsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="neighbors" element={<NeighborsPage />} />
        </Route>
        
        {/* Redirect routes for easy access */}
        <Route path="/events" element={<Navigate to="/dashboard/events" replace />} />
        <Route path="/safety" element={<Navigate to="/dashboard/safety" replace />} />
        <Route path="/care" element={<Navigate to="/dashboard/care" replace />} />
        <Route path="/goods" element={<Navigate to="/dashboard/goods" replace />} />
        <Route path="/skills" element={<Navigate to="/dashboard/skills" replace />} />
        <Route path="/neighbors" element={<Navigate to="/dashboard/neighbors" replace />} />
      </Routes>
    </div>
  );
}

export default App;
