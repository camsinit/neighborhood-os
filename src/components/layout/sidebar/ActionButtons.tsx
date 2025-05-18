
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Props for the ActionButtons component
 */
interface ActionButtonsProps {
  // No longer needed as we'll navigate instead of opening settings
  // onOpenSettings?: () => void;
}

/**
 * ActionButtons component
 * 
 * Displays the settings and invite buttons at the bottom of the sidebar
 * Now navigates to dedicated pages instead of opening dialogs
 */
const ActionButtons = ({}: ActionButtonsProps) => {
  // Use React Router's navigate function for page navigation
  const navigate = useNavigate();
  
  return (
    <div className="space-y-2">
      {/* Settings button - using default variant now for consistent white background */}
      <Button
        variant="ghost" 
        size="sm"
        className="w-full justify-start bg-white" 
        onClick={() => navigate('/settings')}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      
      {/* Invite button - using default variant now for consistent white background */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start bg-white"
        onClick={() => navigate('/invite')}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Neighbor
      </Button>
    </div>
  );
};

export default ActionButtons;
