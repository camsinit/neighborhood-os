
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
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b p-4">
      <div className="flex justify-between items-center">
        {/* Neighborhood name on the left */}
        <h1 className="text-2xl font-bold">
          {currentNeighborhood?.name || "Your Neighborhood"}
        </h1>
        
        {/* Notifications and profile on the right */}
        <div className="flex items-center gap-4">
          {/* Notifications popover */}
          <div className="bg-gray-50 px-4 py-2 rounded-full flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Notifications</span>
          </div>
          
          {/* User avatar/profile */}
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-medium">
                {user?.user_metadata?.name?.[0] || "?"}
              </div>
            )}
          </div>
          
          {/* User name */}
          <span className="font-medium">
            {user?.user_metadata?.name || "Cam"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
