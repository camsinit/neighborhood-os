
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InviteDialog from "@/components/InviteDialog";

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
 * Now uses the light variant for more visual consistency
 * 
 * @param onOpenSettings - Function to call when the settings button is clicked
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
  // State to control the invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      {/* Settings button - using light variant */}
      <Button
        variant="light"
        size="sm"
        className="w-full justify-start"
        onClick={onOpenSettings}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      
      {/* Invite button - using light variant */}
      <Button
        variant="light"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Neighbor
      </Button>
      
      {/* Invite dialog */}
      <InviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
};

export default ActionButtons;
