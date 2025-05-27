
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
 * Updated to exactly match the font size and spacing of main navigation items
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
      
      {/* Unified invite dialog */}
      <UnifiedInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
};

export default ActionButtons;
