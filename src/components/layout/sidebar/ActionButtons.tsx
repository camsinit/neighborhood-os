
import { UserPlus, Bug, Grid3X3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnifiedInviteDialog from "@/components/invite/UnifiedInviteDialog";
import { useSuperAdminAccess } from "@/hooks/useSuperAdminAccess";
import { cn } from "@/lib/utils";

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
 * Now uses consistent NavLink styling to match the main navigation exactly
 */
const ActionButtons = ({ onOpenSettings }: ActionButtonsProps) => {
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
   * Handle invite button click - open the unified invite dialog
   */
  const handleInviteClick = () => {
    console.log('[ActionButtons] Opening invite dialog');
    setIsInviteOpen(true);
  };
  
  return (
    <div className="space-y-1">
      {/* Modules navigation - using NavLink for consistency */}
      <NavLink
        to="/modules"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg transition-colors",
            isActive
              ? "bg-gray-100"
              : "hover:bg-gray-50"
          )
        }
      >
        <Grid3X3 className="h-5 w-5 flex-shrink-0" />
        Modules
      </NavLink>

      {/* Settings navigation - using NavLink with profile image */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg transition-colors",
            isActive
              ? "bg-gray-100"
              : "hover:bg-gray-50"
          )
        }
      >
        {/* User profile image with same dimensions as other icons */}
        <Avatar className="h-5 w-5 flex-shrink-0">
          <AvatarImage 
            src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
            alt={displayName} 
          />
          <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        Settings
      </NavLink>
      
      {/* Invite button - using button but styled to match NavLink exactly */}
      <button
        onClick={handleInviteClick}
        className="flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg transition-colors hover:bg-gray-50 w-full text-left"
      >
        <UserPlus className="h-5 w-5 flex-shrink-0" />
        Invite Neighbor
      </button>

      {/* Debug navigation - only visible to Super Admins, styled consistently */}
      {isSuperAdmin && (
        <NavLink
          to="/debug"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-red-100 text-red-700"
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            )
          }
        >
          <Bug className="h-5 w-5 flex-shrink-0" />
          Debug
        </NavLink>
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
