import { Settings } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
 * Displays the top navigation bar with user profile dropdown
 * - Simplified to remove dashboard title and notifications
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
  return;
};
export default Header;