
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './Header';
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

/**
 * MainLayout component
 * 
 * This component provides a consistent layout for all protected pages, including:
 * 1. The sidebar navigation
 * 2. Header with user info and actions
 * 3. A content area for page-specific components
 * 
 * Uses React Router's Outlet to render child routes within this layout
 */
const MainLayout = () => {
  // State to control the settings dialog visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Function to handle opening settings dialog
  const handleOpenSettings = () => {
    console.log("[MainLayout] Opening settings dialog - setting state to true");
    // Directly open the dialog by setting state to true
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header with user info and actions */}
        <Header onOpenSettings={handleOpenSettings} />
        
        {/* Page content - rendered via Outlet */}
        <main className="flex-1 overflow-auto">
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
