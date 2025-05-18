
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Import Outlet for nested routing
import Sidebar from "./sidebar";
import LoggingControls from "@/components/debug/LoggingControls";

/**
 * MainLayout component
 * 
 * Provides the primary layout structure for the application with:
 * - Sidebar navigation on the left
 * - Main content area without header (removed)
 * - Uses React Router's Outlet to render child routes
 * 
 * @returns The main layout structure with sidebar and content area
 */
const MainLayout = () => {
  // Get the current location to determine if we're on the homepage
  const location = useLocation();
  // We no longer use this variable since we're removing the header
  // const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="h-screen flex">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header removed as requested */}
        
        {/* Main content - takes full height */}
        <main className="flex-1 overflow-auto">
          {/* Use Outlet to render child routes from App.tsx */}
          <Outlet />
        </main>
        
        {/* Add the logging controls component */}
        <LoggingControls />
      </div>
    </div>
  );
};

export default MainLayout;
