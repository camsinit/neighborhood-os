
import { UserPlus, Bug, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnifiedInviteDialog from "@/components/invite/UnifiedInviteDialog";
import { useSuperAdminAccess } from "@/hooks/useSuperAdminAccess";

/**
 * Props for the ActionButtons component - onOpenSettings is no longer needed
 */
interface ActionButtonsProps {
  onOpenSettings?: () => void; // Keep for backward compatibility but won't be used
}

/**
 * ActionButtons component
 * 
 * Displays the modules, settings, invite, and debug buttons at the bottom of the sidebar
 * Now includes Modules navigation and maintains consistent styling with main navigation
 * REVERTED: Back to original font styling and proper settings button alignment
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
  // Get navigation function
  const navigate = useNavigate();
  
  // Get current user for profile image
  const user = useUser();
  
  // Check if user has super admin access for debug page
  const { isSuperAdmin } = useSuperAdminAccess();
  
  // State to control the unified invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Query to get user profile data for the avatar
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Get user's display name or fallback
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  
  /**
   * Handle modules button click - navigate to modules page
   */
  const handleModulesClick = () => {
    console.log('[ActionButtons] Navigating to modules page');
    navigate('/modules');
  };

  /**
   * Handle settings button click - navigate to settings page
   */
  const handleSettingsClick = () => {
    console.log('[ActionButtons] Navigating to settings page');
    navigate('/settings');
  };

  /**
   * Handle debug button click - navigate to debug page
   */
  const handleDebugClick = () => {
    console.log('[ActionButtons] Navigating to debug page');
    navigate('/debug');
  };
  
  return (
    <div className="space-y-1">
      {/* Modules button - matches main navigation styling */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-gray-900 hover:bg-gray-50 hover:text-gray-900"
        onClick={handleModulesClick}
      >
        <Grid3X3 className="h-5 w-5 text-gray-900" />
        Modules
      </Button>

      {/* Settings button - now uses profile image with proper alignment */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-gray-900 hover:bg-gray-50"
        onClick={handleSettingsClick}
      >
        {/* User profile image with same dimensions as other icons and proper alignment */}
        <Avatar className="h-5 w-5">
          <AvatarImage 
            src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
            alt={displayName} 
          />
          <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        Settings
      </Button>
      
      {/* Invite button - matches main navigation styling */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-gray-900 hover:bg-gray-50"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserPlus className="h-5 w-5" />
        Invite Neighbor
      </Button>

      {/* Debug button - only visible to Super Admins */}
      {isSuperAdmin && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDebugClick}
        >
          <Bug className="h-5 w-5" />
          Debug
        </Button>
      )}
      
      {/* Unified invite dialog */}
      <UnifiedInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
};

export default ActionButtons;
