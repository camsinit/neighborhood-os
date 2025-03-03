
import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
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
  onOpenSettings?: () => void; // Make this optional since we're managing state internally
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Get current user
  const user = useUser();
  
  // Get neighborhood context for diagnostics data
  const { 
    currentNeighborhood, 
    isLoading: isNeighborhoodLoading, 
    error: neighborhoodError,
    refreshNeighborhoodData,
    isCoreContributor
  } = useNeighborhood();
  
  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    console.log("[Sidebar] Opening invite dialog");
    setIsInviteOpen(true);
  };

  // Function to handle opening settings dialog
  const handleOpenSettings = () => {
    // Add debugging to track the settings dialog opening
    console.log("[Sidebar] Opening settings dialog from Sidebar component");
    
    // Set local state to open the dialog
    setIsSettingsOpen(true);
    
    // Also call the optional callback if provided (for backward compatibility)
    if (typeof onOpenSettings === 'function') {
      try {
        onOpenSettings();
        console.log("[Sidebar] External settings callback executed from Sidebar");
      } catch (error) {
        console.error("[Sidebar] Error executing external settings callback:", error);
      }
    }
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
          isNeighborhoodLoading={isNeighborhoodLoading}
          neighborhoodError={neighborhoodError}
          refreshNeighborhoodData={refreshNeighborhoodData}
        />
        
        {/* Diagnostics information panel */}
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
