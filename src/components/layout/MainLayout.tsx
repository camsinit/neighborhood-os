
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

/**
 * MainLayout component
 * 
 * This component provides a consistent layout for all protected pages, with styling
 * inspired by our chat interface.
 * 
 * Includes:
 * 1. The sidebar navigation
 * 2. A content area for page-specific components with enhanced styling
 * 
 * Uses React Router's Outlet to render child routes within this layout
 */
const MainLayout = () => {
  // State to control the settings dialog visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the home page to apply specific styling
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  
  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar navigation */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      {/* 
        Main content area with improved styling for consistent look and feel
        with the chat interface
      */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isHomePage ? 'bg-white' : ''}`}>
        {/* 
          Page content with enhanced styling
          - Added padding for consistency
          - Improved scrolling behavior
        */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Settings dialog wrapper component */}
      <SettingsDialogWrapper
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default MainLayout;
