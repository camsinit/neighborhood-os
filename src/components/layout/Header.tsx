
/**
 * Header component props
 */
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { UserCircle2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";

/**
 * Header component props
 */
interface HeaderProps {
  // No additional props needed
}

/**
 * Header component
 * 
 * Displays the application header with neighborhood name, user information,
 * notifications popover, and quick access to settings
 */
const Header = ({}: HeaderProps) => {
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();
  const navigate = useNavigate();
  
  // Handle opening the settings page
  const handleOpenSettings = () => {
    navigate("/settings");
  };

  return (
    <header className="bg-white border-b p-4">
      <div className="flex justify-between items-center">
        {/* Neighborhood name on the left */}
        <h1 className="text-2xl font-bold">
          {currentNeighborhood?.name || "Your Neighborhood"}
        </h1>
        
        {/* User info, notifications, and settings on the right */}
        <div className="flex items-center gap-2">
          {/* User name or welcome message */}
          <span className="mr-2 font-medium">
            {user?.user_metadata?.name || "Welcome"}
          </span>
          
          {/* User avatar icon */}
          <UserCircle2 className="h-8 w-8 text-gray-500" />
          
          {/* Notifications popover */}
          <NotificationsPopover />
          
          {/* Settings button */}
          <Button variant="ghost" size="icon" onClick={handleOpenSettings}>
            <Settings className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
