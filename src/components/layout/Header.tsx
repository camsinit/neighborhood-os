
import { Settings, Home, Plus } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationDrawer } from "@/notifications";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useCreateNeighborhoodAccess } from "@/hooks/useCreateNeighborhoodAccess";
import { CreateNeighborhoodDialog } from "@/components/neighborhoods/CreateNeighborhoodDialog";
// Import toast directly from sonner for success messages
import { toast as sonnerToast } from 'sonner';

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
 * Displays the top navigation bar with:
 * - Quick Actions title
 * - Static neighborhood display (no switching)
 * - Notifications button
 * - User profile dropdown
 * 
 * UPDATED: Removed neighborhood switching functionality
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
  const { toast } = useToast();
  
  // Get neighborhood context data - simplified
  const { currentNeighborhood } = useNeighborhood();
  const { hasAccess: canCreateNeighborhood } = useCreateNeighborhoodAccess();
  
  // State for create neighborhood dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Query the profile data for the current user
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('avatar_url, display_name').eq('id', user.id).single();
      return data;
    },
    enabled: !!user?.id // Only run the query when user is available
  });

  /**
   * Handle signing out the user
   * Only shows toast for errors, success is indicated by navigation
   */
  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/login");
      // Success is indicated by navigation - no toast needed
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Removed the 'border-b' class from the header to remove the bottom border stroke */}
      <header className="h-16 px-4 flex items-center justify-between">
        {/* Left side - Quick Actions title */}
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        
        {/* Right side - static neighborhood display, notifications and profile */}
        <div className="flex items-center gap-2">
          {/* Static Neighborhood Display */}
          <div className="flex items-center text-sm font-medium text-gray-900">
            <Home className="h-4 w-4 mr-2" />
            <span>{currentNeighborhood?.name || 'Neighborhood'}</span>
            
            {/* Show create option if user has access and no neighborhood */}
            {canCreateNeighborhood && !currentNeighborhood && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="ml-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            )}
          </div>
          
          {/* Add the enhanced notification button */}
          <NotificationDrawer />
          
          {/* User profile dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-md p-1 transition-colors">
                {/* User avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                  <AvatarFallback>
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Display name (only show on larger screens) */}
                <span className="text-sm font-medium hidden md:inline-block">
                  {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Settings option */}
              <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Sign out option */}
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Create Neighborhood Dialog */}
      <CreateNeighborhoodDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default Header;
