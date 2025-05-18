
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * ActionButtons component
 * 
 * Displays the settings and invite buttons at the bottom of the sidebar
 * Now uses the user's avatar for the settings button instead of a gear icon
 */
const ActionButtons = () => {
  // Use React Router's navigate function for page navigation
  const navigate = useNavigate();
  
  // Get the current user to access their profile image
  const user = useUser();
  
  return (
    <div className="space-y-2">
      {/* Settings button - Navigate to settings page */}
      <Button
        variant="ghost" 
        size="sm"
        className="w-full justify-start bg-white" 
        onClick={() => navigate('/settings')}
      >
        {/* Replace the Settings icon with the user's Avatar */}
        <Avatar className="mr-2 h-6 w-6">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        Settings
      </Button>
      
      {/* Invite button - Navigate to invite page */}
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
