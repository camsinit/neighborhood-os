
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";
import { BASE_ROUTES, isOnBaseRoute } from "@/utils/routes";
import { createLogger } from "@/utils/logger";
import AdminQuickstartOverlay from "@/components/admin/AdminQuickstartOverlay";

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
  // Create a module-scoped logger instance for controlled logging
  const logger = createLogger('MainLayout');
  // Get the current location to determine if we're on the homepage (neighborhood-aware)
  const location = useLocation();
  const isHomePage = isOnBaseRoute(location.pathname, BASE_ROUTES.home);

  /**
   * Handler for settings button click
   * This is now deprecated since settings is a page, but kept for header compatibility
   */
  const handleOpenSettings = () => {
    // Use logger to make this visible only in debug/dev
    logger.warn("Settings handled by navigation - this shouldn't be called");
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
      {/* Admin Quickstart overlay mounts globally and shows only when one-time flag is set */}
      <AdminQuickstartOverlay />
    </div>
  );
};

export default MainLayout;
