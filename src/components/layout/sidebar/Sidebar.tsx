
import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import InviteDialog from "@/components/InviteDialog";

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
  onOpenSettings: () => void;
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  // State to control the invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
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
    console.log("Opening invite dialog");
    setIsInviteOpen(true);
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
          onOpenSettings={onOpenSettings}
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
    </div>
  );
};

export default Sidebar;
