
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
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
  const navigate = useNavigate();
  
  // State to track authentication checking status
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Added state for settings dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle opening settings dialog
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    console.log("Opening settings dialog");
  };

  // Check authentication status when the component mounts
  useEffect(() => {
    console.log("[App] Setting up auth state change listener");
    
    // Subscribe to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[App] Auth state changed:", { event, sessionExists: !!session });
      
      setIsCheckingAuth(false);
      setIsAuthenticated(!!session);
      
      // When user is signed in and event is SIGNED_IN, redirect to dashboard
      if (event === 'SIGNED_IN' && session) {
        console.log("[App] User is signed in, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else if (event === 'SIGNED_OUT') {
        console.log("[App] User signed out, redirecting to login");
        navigate("/login", { replace: true });
      }
    });

    // Initial check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("[App] Initial session check:", { hasSession: !!data.session });
        setIsAuthenticated(!!data.session);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("[App] Error checking session:", error);
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();

    // Clean up the subscription when the component unmounts
    return () => {
      console.log("[App] Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [supabase.auth, navigate]); // Add navigate to dependency array

  // Component to protect routes that require authentication
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    console.log("[ProtectedRoute] Checking auth:", { isAuthenticated, isCheckingAuth });
    
    // If checking auth, show loading state or nothing
    if (isCheckingAuth) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("[ProtectedRoute] User not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    }

    // If authenticated, render the children
    console.log("[ProtectedRoute] User is authenticated, rendering protected content");
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
