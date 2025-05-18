
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Add this import for React Router's Outlet
import Sidebar from "./sidebar";
import Header from "./Header";
import LoggingControls from "@/components/debug/LoggingControls";

/**
 * MainLayout component
 * 
 * Provides the primary layout structure for the application with:
 * - Sidebar navigation on the left
 * - Main content area with conditional header (only on homepage) on the right
 * 
 * Now uses React Router's Outlet to render child routes
 */
const MainLayout = () => {
  // Get the current location to determine if we're on the homepage
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="h-screen flex">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Only render the header on the homepage */}
        {isHomePage && (
          <Header />
        )}
        
        {/* Main content - takes full height */}
        <main className="flex-1 overflow-auto">
          {/* Use Outlet to render child routes instead of children prop */}
          <Outlet />
        </main>
        
        {/* Add the logging controls component */}
        <LoggingControls />
      </div>
    </div>
  );
};

export default MainLayout;
