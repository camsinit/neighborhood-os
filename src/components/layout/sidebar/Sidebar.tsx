
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";

// Import sidebar components
import UserProfileCard from './UserProfileCard';
import FeatureNavigation from './FeatureNavigation';
import ActionButtons from './ActionButtons';
import { GhostModeIndicator } from '@/components/ui/GhostModeIndicator';

/**
 * Props for the Sidebar component - onOpenSettings no longer needed
 */
interface SidebarProps {
  onOpenSettings?: () => void; // Keep for backward compatibility but won't be used
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 * Settings now handled via page navigation instead of dialog
 * 
 * @param onOpenSettings - Deprecated prop, kept for backward compatibility
 */
const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  // Get current user
  const user = useUser();
  
  // Get neighborhood context for consistency
  const { 
    currentNeighborhood
  } = useNeighborhood();

  return (
    <div className="w-60 border-r bg-white flex flex-col h-screen sticky top-0">
      {/* User profile card at the top of sidebar */}
      <UserProfileCard />
      
      {/* Ghost mode indicator - shows prominently when in observer mode */}
      <div className="px-3 pt-2">
        <GhostModeIndicator />
      </div>
      
      {/* Navigation menu section */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* All navigation items including Home at the top */}
        <FeatureNavigation />

        {/* Divider before bottom actions - now matches the profile divider */}
        <div className="my-4 h-px bg-gray-100" />

        {/* Settings and Invite buttons - settings now navigates to page */}
        <ActionButtons />
      </nav>
    </div>
  );
};

export default Sidebar;
