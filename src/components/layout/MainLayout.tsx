
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";

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
 * - Debug visibility toggle for development
 * 
 * Settings are now handled as a page route instead of a dialog
 * 
 * @param children - Content to render in the main area
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  // Get the current location to determine if we're on the homepage
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  /**
   * Handler for settings button click
   * This is now deprecated since settings is a page, but kept for header compatibility
   */
  const handleOpenSettings = () => {
    console.log("Settings handled by navigation - this shouldn't be called");
  };

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Only render the header on the homepage */}
        {isHomePage && (
          <Header onOpenSettings={handleOpenSettings} />
        )}
        {/* Removed padding from main element to allow gradients to touch edges */}
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
