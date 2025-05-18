
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";
import LoggingControls from "@/components/debug/LoggingControls";

/**
 * MainLayout component props
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout component
 * 
 * Provides the primary layout structure for the application with:
 * - Sidebar navigation on the left
 * - Main content area with conditional header (only on homepage) on the right
 * 
 * @param children - Content to render in the main area
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  // Get the current location to determine if we're on the homepage
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  return (
    <div className="h-screen flex">
      {/* Sidebar navigation - removed onOpenSettings prop */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Only render the header on the homepage */}
        {isHomePage && (
          <Header />
        )}
        
        {/* Main content - takes full height */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Add the logging controls component */}
        <LoggingControls />
      </div>
    </div>
  );
};

export default MainLayout;
