
import { UserPlus, Bug } from "lucide-react";
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
 * Displays the settings, invite, and debug buttons at the bottom of the sidebar
 * Now includes a Debug button for Super Admins only, positioned under Invite Neighbor
 * Updated to exactly match the font size and spacing of main navigation items
 * UPDATED: Settings button now uses user profile image instead of gear icon
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
      {/* Settings button - now uses profile image instead of gear icon */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={handleSettingsClick}
      >
        {/* User profile image with same dimensions as the previous gear icon */}
        <Avatar className="h-5 w-5">
          <AvatarImage 
            src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
            alt={displayName} 
          />
          <AvatarFallback className="text-xs">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        Settings
      </Button>
      
      {/* Invite button - now exactly matches main navigation styling */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserPlus className="h-5 w-5" />
        Invite Neighbor
      </Button>

      {/* Debug button - only visible to Super Admins */}
      {isSuperAdmin && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
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
