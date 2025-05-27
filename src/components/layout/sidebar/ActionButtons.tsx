
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedInviteDialog from "@/components/invite/UnifiedInviteDialog";

/**
 * Props for the ActionButtons component - onOpenSettings is no longer needed
 */
interface ActionButtonsProps {
  onOpenSettings?: () => void; // Keep for backward compatibility but won't be used
}

/**
 * ActionButtons component
 * 
 * Displays the settings and invite buttons at the bottom of the sidebar
 * Now navigates to the settings page instead of opening a dialog
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
  // Get navigation function
  const navigate = useNavigate();
  
  // State to control the unified invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  /**
   * Handle settings button click - navigate to settings page
   */
  const handleSettingsClick = () => {
    console.log('[ActionButtons] Navigating to settings page');
    navigate('/settings');
  };
  
  return (
    <div className="space-y-2">
      {/* Settings button - now navigates to /settings page */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={handleSettingsClick}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      
      {/* Invite button - still opens the unified dialog */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Neighbor
      </Button>
      
      {/* Unified invite dialog */}
      <UnifiedInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
};

export default ActionButtons;
