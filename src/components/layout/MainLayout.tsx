
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

/**
 * MainLayout component
 * 
 * This component provides a consistent layout for all protected pages, including:
 * 1. The sidebar navigation
 * 2. A content area for page-specific components
 * 
 * Uses React Router's Outlet to render child routes within this layout
 */
const MainLayout = () => {
  // State to control the settings dialog visibility
  // We keep this at the layout level so it can be opened from anywhere in the app
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the home page to apply specific styling
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isHomePage ? 'bg-white' : ''}`}>
        {/* Page content - rendered via Outlet */}
        <main className={`flex-1 overflow-auto ${isHomePage ? 'bg-white' : ''}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Settings dialog wrapper component (shown when isSettingsOpen is true) */}
      <SettingsDialogWrapper
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default MainLayout;
