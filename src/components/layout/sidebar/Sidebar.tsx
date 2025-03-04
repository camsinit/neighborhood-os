
import { useState } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import InviteDialog from "@/components/InviteDialog";
import SettingsDialogWrapper from "@/components/dialog/SettingsDialogWrapper";

// Import sidebar components
import Logo from './Logo';
import MainNavigation from './MainNavigation';
import FeatureNavigation from './FeatureNavigation';
import ActionButtons from './ActionButtons';
import DiagnosticsPanel from './DiagnosticsPanel';

/**
 * Sidebar component props
 * onOpenSettings is a function that will be called when the settings button is clicked
 */
interface SidebarProps {
  onOpenSettings?: () => void; // This is now completely optional and unused
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  // State to control the invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // State to control the settings dialog visibility
  // This is the ONLY state that controls whether the dialog is open
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Get current user
  const user = useUser();
  
  // Get neighborhood context for diagnostics data
  const { 
    currentNeighborhood, 
    isCoreContributor
  } = useNeighborhood();
  
  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    console.log("[Sidebar] Opening invite dialog");
    setIsInviteOpen(true);
  };

  // Function to handle opening settings dialog
  // This is the ONLY function that controls opening the dialog
  const handleOpenSettings = () => {
    console.log("[Sidebar] Opening settings dialog - setting state to true");
    // Directly open the dialog by setting state to true
    setIsSettingsOpen(true);
    // We've removed the external callback completely to avoid any interference
  };

  return (
    <div className="w-48 border-r bg-white flex flex-col">
      {/* Logo section at the top of sidebar */}
      <Logo />
      
      {/* Navigation menu section */}
      <nav className="flex-1 px-2">
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
          onOpenInvite={handleOpenInvite}
        />
        
        {/* Diagnostics information panel - with reduced content */}
        <DiagnosticsPanel 
          user={user}
          currentNeighborhood={currentNeighborhood}
          isCoreContributor={isCoreContributor}
        />
      </nav>
      
      {/* Invite dialog component (shown when isInviteOpen is true) */}
      <InviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
      />
      
      {/* Settings dialog wrapper component (shown when isSettingsOpen is true) */}
      <SettingsDialogWrapper
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Sidebar;
