
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";
import { DebugDashboard } from "@/components/debug/DebugDashboard";
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

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
 * - Debug dashboard for development
 * - Settings dialog management
 * 
 * @param children - Content to render in the main area
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  // Get the current location to determine if we're on the homepage
  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  
  // State to manage the settings dialog visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /**
   * Handler for settings button click
   * Opens the settings dialog when the settings button is clicked
   */
  const handleOpenSettings = () => {
    console.log("Opening settings dialog");
    setIsSettingsOpen(true);
  };

  return (
    <div className="h-screen flex">
      <Sidebar onOpenSettings={handleOpenSettings} />
      <div className="flex-1 overflow-auto">
        {/* Only render the header on the homepage */}
        {isHomePage && (
          <Header onOpenSettings={handleOpenSettings} />
        )}
        {/* Removed padding from main element to allow gradients to touch edges */}
        <main className="h-full">
          {children}
        </main>
        
        {/* Add the debug dashboard - only shows in development */}
        <DebugDashboard />
      </div>
      
      {/* Settings dialog - managed at the layout level so it can be opened from anywhere */}
      <SettingsDialogWrapper
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default MainLayout;
