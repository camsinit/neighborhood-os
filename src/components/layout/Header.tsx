
/**
 * Header component that displays the application header
 */
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
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
 * Uses consistent routing strategy with useNavigate for all navigation
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

  // Handle profile/settings click
  const handleProfileClick = () => {
    console.log("[Header] Navigating to settings page");
    navigate('/settings');
  };

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
          <button
            className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium"
            onClick={handleProfileClick}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
