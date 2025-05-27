
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import UnifiedInviteDialog from "@/components/invite/UnifiedInviteDialog";

/**
 * Props for the ActionButtons component
 */
interface ActionButtonsProps {
  // Function to call when the settings button is clicked
  onOpenSettings?: () => void;
}

/**
 * ActionButtons component
 * 
 * Displays the settings and invite buttons at the bottom of the sidebar
 * Now uses the new unified invite dialog system
 * 
 * @param onOpenSettings - Function to call when the settings button is clicked
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
  // State to control the unified invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      {/* Settings button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={onOpenSettings}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      
      {/* Invite button - now opens the unified dialog */}
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
