
import { useState } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

// Import sidebar components
import Logo from './Logo';
import MainNavigation from './MainNavigation';
import FeatureNavigation from './FeatureNavigation';
import ActionButtons from './ActionButtons';
import DiagnosticsPanel from './DiagnosticsPanel';

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = () => {
  // State to control the settings dialog visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Get current user
  const user = useUser();
  
  // Get neighborhood context for diagnostics data
  const { 
    currentNeighborhood
  } = useNeighborhood();

  // Function to handle opening settings dialog
  const handleOpenSettings = () => {
    console.log("[Sidebar] Opening settings dialog - setting state to true");
    // Directly open the dialog by setting state to true
    setIsSettingsOpen(true);
  };

  return (
    <div className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
      {/* Logo section at the top of sidebar */}
      <Logo />
      
      {/* Navigation menu section */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Home/Dashboard navigation */}
        <MainNavigation />

        {/* Divider between navigation groups */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Feature navigation items */}
        <FeatureNavigation />

        {/* Divider before bottom actions */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Settings and Invite buttons */}
        <ActionButtons 
          onOpenSettings={handleOpenSettings}
        />
        
        {/* Diagnostics information panel - with reduced content */}
        <DiagnosticsPanel 
          user={user}
          currentNeighborhood={currentNeighborhood}
        />
      </nav>
      
      {/* Settings dialog wrapper component (shown when isSettingsOpen is true) */}
      <SettingsDialogWrapper
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Sidebar;
