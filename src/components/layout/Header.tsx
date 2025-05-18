
/**
 * Header component that displays the application header
 */
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Bell } from "lucide-react";
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
 * Displays the application header with neighborhood name and notifications
 */
const Header = ({}: HeaderProps) => {
  // Get current user information from Supabase auth
  const user = useUser();
  
  // Get neighborhood information from context
  const {
    currentNeighborhood
  } = useNeighborhood();
  
  // For navigation
  const navigate = useNavigate();

  // Return the header UI with neighborhood name and user controls
  return (
    <header className="w-full border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Neighborhood name section */}
        <div>
          <h1 className="font-bold text-2xl">{currentNeighborhood?.name || 'Welcome'}</h1>
        </div>

        {/* User controls section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <NotificationsPopover />
          
          {/* User avatar/profile - simplified version */}
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => navigate('/settings')}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
