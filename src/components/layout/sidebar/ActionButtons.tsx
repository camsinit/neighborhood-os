
import { Settings, UserPlus, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedInviteDialog from "@/components/invite/UnifiedInviteDialog";
import { useSuperAdminAccess } from "@/hooks/useSuperAdminAccess";

/**
 * Props for the ActionButtons component - onOpenSettings is no longer needed
 */
interface ActionButtonsProps {
  onOpenSettings?: () => void; // Keep for backward compatibility but won't be used
}

/**
 * ActionButtons component
 * 
 * Displays the settings, invite, and debug buttons at the bottom of the sidebar
 * Now includes a Debug button for Super Admins only, positioned under Invite Neighbor
 * Updated to exactly match the font size and spacing of main navigation items
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
  // Get navigation function
  const navigate = useNavigate();
  
  // Check if user has super admin access for debug page
  const { isSuperAdmin } = useSuperAdminAccess();
  
  // State to control the unified invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  /**
   * Handle settings button click - navigate to settings page
   */
  const handleSettingsClick = () => {
    console.log('[ActionButtons] Navigating to settings page');
    navigate('/settings');
  };

  /**
   * Handle debug button click - navigate to debug page
   */
  const handleDebugClick = () => {
    console.log('[ActionButtons] Navigating to debug page');
    navigate('/debug');
  };
  
  return (
    <div className="space-y-1">
      {/* Settings button - now exactly matches main navigation styling */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={handleSettingsClick}
      >
        <Settings className="h-5 w-5" />
        Settings
      </Button>
      
      {/* Invite button - now exactly matches main navigation styling */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserPlus className="h-5 w-5" />
        Invite Neighbor
      </Button>

      {/* Debug button - only visible to Super Admins */}
      {isSuperAdmin && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDebugClick}
        >
          <Bug className="h-5 w-5" />
          Debug
        </Button>
      )}
      
      {/* Unified invite dialog */}
      <UnifiedInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
};

export default ActionButtons;
