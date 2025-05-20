
/**
 * Header component that displays the application header
 */
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useNavigate, Link } from "react-router-dom";
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

  // Handle click on neighborhood name (home)
  const handleHomeClick = () => {
    console.log("[Header] Navigating to home page");
    navigate('/home');
  };

  // Handle view landing page click
  const handleViewLandingClick = () => {
    console.log("[Header] Navigating to landing page");
    navigate('/landing');
  };

  // Return the header UI with neighborhood name and user controls
  return (
    <header className="w-full border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Neighborhood name section - clickable to go home */}
        <div>
          <button 
            onClick={handleHomeClick} 
            className="font-bold text-2xl hover:text-primary transition-colors"
          >
            {currentNeighborhood?.name || 'Welcome'}
          </button>
        </div>

        {/* User controls section */}
        <div className="flex items-center space-x-4">
          {/* Landing page link */}
          <button
            onClick={handleViewLandingClick}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            View Landing Page
          </button>
          
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
