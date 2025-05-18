
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";

// Import sidebar components
import Logo from './Logo';
import MainNavigation from './MainNavigation';
import FeatureNavigation from './FeatureNavigation';
import ActionButtons from './ActionButtons';
import DiagnosticsPanel from './DiagnosticsPanel';
// LoggingControls import is already handled inside DiagnosticsPanel

/**
 * Props for the Sidebar component
 */
interface SidebarProps {
  // Removed onOpenSettings since we're navigating instead
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = ({}: SidebarProps) => {
  // Get current user
  const user = useUser();
  
  // Get neighborhood context for diagnostics data
  const { 
    currentNeighborhood
  } = useNeighborhood();

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

        {/* Settings and Invite buttons - no longer needs onOpenSettings prop */}
        <ActionButtons />
        
        {/* Diagnostics information panel - with reduced content */}
        <DiagnosticsPanel 
          user={user}
          currentNeighborhood={currentNeighborhood}
        />
        
        {/* The LoggingControls have been moved into the DiagnosticsPanel component */}
      </nav>
    </div>
  );
};

export default Sidebar;
