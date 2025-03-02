import {
  BrowserRouter as Router,
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
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import SafetyPage from "./pages/SafetyPage";
import CarePage from "./pages/CarePage";
import GoodsPage from "./pages/GoodsPage";
import SkillsPage from "./pages/SkillsPage";
import NeighborsPage from "./pages/NeighborsPage";
import LandingPage from "./pages/LandingPage";
import WaitlistAdmin from "./pages/WaitlistAdmin";

function App() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      // You can add any additional auth checks here if needed
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [session, supabase]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session && !isCheckingAuth) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join/:inviteCode?" element={<JoinPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
        
        {/* Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
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
        
        {/* Redirects from old URLs to new dashboard structure */}
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
