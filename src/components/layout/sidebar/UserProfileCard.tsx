import { Link } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * UserProfileCard component
 * 
 * Displays a compact user profile card in the sidebar with:
 * - User's profile avatar with fallback to initials
 * - User's display name or email
 * - Current neighborhood name
 * - Settings gear icon that navigates to /settings page
 */
const UserProfileCard = () => {
  // Get current authenticated user from Supabase
  const user = useUser();
  
  // Get current neighborhood context
  const { currentNeighborhood } = useNeighborhood();

  // Fetch user profile data from our profiles table
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Don't render if no user is logged in
  if (!user) {
    return null;
  }

  // Determine display name: use profile display_name, fall back to email
  const displayName = profile?.display_name || user.email || 'User';
  
  // Create initials from display name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 rounded-bl-lg rounded-br-lg shadow border border-border/20">
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={profile?.avatar_url || undefined} 
            alt={`${displayName}'s profile picture`} 
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        
        {/* User Info Section */}
        <div className="flex-1 min-w-0">
          {/* User Display Name */}
          <div className="font-medium text-sm text-foreground truncate">
            {displayName}
          </div>
          
          {/* Current Neighborhood Name */}
          {currentNeighborhood && (
            <div className="text-xs text-muted-foreground truncate">
              {currentNeighborhood.name}
            </div>
          )}
        </div>
        
        {/* Settings Gear Icon */}
        <Link 
          to="/settings" 
          className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default UserProfileCard;