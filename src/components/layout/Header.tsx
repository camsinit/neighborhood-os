
import { Settings, UserCircle } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Header component props
 * onOpenSettings is a function that will be called when the settings option is clicked
 */
interface HeaderProps {
  onOpenSettings: () => void;
}

/**
 * Header component
 * 
 * Displays the top navigation bar with user profile dropdown and notifications
 */
const Header = ({
  onOpenSettings
}: HeaderProps) => {
  // Get the Supabase client for authentication actions
  const supabaseClient = useSupabaseClient();
  // Get the current user
  const user = useUser();
  // Get the navigation function from react-router
  const navigate = useNavigate();
  // Get the toast function for showing notifications
  const {
    toast
  } = useToast();

  // Query the profile data for the current user
  const {
    data: profile
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const {
        data
      } = await supabase.from('profiles').select('avatar_url, display_name').eq('id', user.id).single();
      return data;
    },
    enabled: !!user?.id // Only run the query when user is available
  });

  /**
   * Handle signing out the user
   */
  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/login");
      toast({
        title: "Signed out successfully"
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      {/* Header title - left side */}
      <div className="text-lg font-medium">Dashboard</div>
      
      {/* User profile and notifications - right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications popover */}
        <NotificationsPopover />
        
        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.display_name ? profile.display_name[0] : user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="font-medium">
                {profile?.display_name || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {user?.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
