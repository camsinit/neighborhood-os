import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Lock, Globe, Calendar, User } from 'lucide-react';
import { Group, GroupMember } from '@/types/groups';
import { cn } from '@/lib/utils';
import { GroupService } from '@/services/groupService';
import { useDataAttributes } from '@/utils/dataAttributes';
import { useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
interface GroupCardProps {
  group: Group;
  className?: string;
  onClick?: (group: Group) => void;
  showJoinButton?: boolean;
}
export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  className,
  onClick,
  showJoinButton = false
}) => {
  // State to hold member avatars for the profile stack
  const [memberAvatars, setMemberAvatars] = useState<GroupMember[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  // Hooks for joining/leaving groups and getting current user
  const groupService = new GroupService();
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const user = useUser();
  
  // State for leave confirmation mode
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  
  // Add data attributes for highlighting support
  const dataAttributes = useDataAttributes('group', group.id);

  // Fetch current user profile for optimistic updates
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        setCurrentUserProfile(profile);
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };
    
    fetchCurrentUserProfile();
  }, [user?.id]);

  // Fetch group members to display profile images
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await groupService.getGroupMembers(group.id);
        // Only show first 4 members for the profile stack
        setMemberAvatars(members.slice(0, 4));
      } catch (error) {
        console.error('Error fetching group members:', error);
      }
    };
    fetchMembers();
  }, [group.id, group.member_count]); // Re-fetch when member count changes
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(group);
  };

  /**
   * Handle joining a group with optimistic updates
   */
  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user?.id || group.current_user_membership) {
      return; // Already joined or not authenticated
    }

    // Optimistically add current user to member avatars if there's space
    if (currentUserProfile && memberAvatars.length < 4) {
      const optimisticMember: GroupMember = {
        id: `temp-${user.id}`,
        group_id: group.id,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString(),
        invited_by: null,
        profile: currentUserProfile
      };
      
      setMemberAvatars(prev => [...prev, optimisticMember]);
    }

    try {
      await joinGroupMutation.mutateAsync(group.id);
    } catch (error) {
      // Revert optimistic update on error
      if (currentUserProfile && memberAvatars.length < 4) {
        setMemberAvatars(prev => prev.filter(member => member.id !== `temp-${user.id}`));
      }
      console.error('Failed to join group:', error);
    }
  };

  /**
   * Handle leaving a group with optimistic updates
   */
  const handleLeaveGroup = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user?.id || !group.current_user_membership) {
      return; // Not joined or not authenticated
    }

    // Optimistically remove current user from member avatars
    const originalAvatars = memberAvatars;
    setMemberAvatars(prev => prev.filter(member => member.user_id !== user.id));
    
    // Reset leave confirmation state
    setShowLeaveConfirm(false);

    try {
      await leaveGroupMutation.mutateAsync(group.id);
    } catch (error) {
      // Revert optimistic update on error
      setMemberAvatars(originalAvatars);
      console.error('Failed to leave group:', error);
    }
  };

  /**
   * Handle button click based on current state
   */
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!group.current_user_membership) {
      // User not joined, handle join
      handleJoinGroup(e);
    } else if (!showLeaveConfirm) {
      // User joined, show leave confirmation
      setShowLeaveConfirm(true);
    } else {
      // User confirmed leave, handle leave
      handleLeaveGroup(e);
    }
  };

  // Function to render overlapping profile images
  const renderMemberStack = () => {
    if (memberAvatars.length === 0) return null;
    return <div className="flex items-center gap-1">
        {/* Profile stack - overlapping avatars */}
        <div className="flex -space-x-2">
          {memberAvatars.map((member, index) => <Avatar key={member.id} className="h-8 w-8 border-2 border-white ring-1 ring-gray-100" style={{
          zIndex: memberAvatars.length - index
        }}>
              <AvatarImage src={member.profile?.avatar_url || ''} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {member.profile?.display_name?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>)}
        </div>
        
        {/* Member count text with better contrast - use actual member count or avatar count */}
        <span className="text-sm text-gray-800 ml-1">
          {Math.max(group.member_count || 0, memberAvatars.length)} {Math.max(group.member_count || 0, memberAvatars.length) === 1 ? 'Neighbor' : 'Neighbors'}
        </span>
      </div>;
  };
  return <Card 
    className={cn("overflow-hidden hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 cursor-pointer", "bg-white border-2 border-gray-300 hover:border-purple-400 rounded-xl", className)}
    onClick={handleCardClick}
    {...dataAttributes}
  >
      {/* Cover Photo Section */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/40 overflow-hidden">
        {group.banner_image_url ? <img src={group.banner_image_url} alt={`${group.name} cover`} className="w-full h-full object-cover" /> :
      // Default gradient background with subtle pattern
      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
            <div className="text-primary/60">
              {group.group_type === 'physical' ? <MapPin className="h-12 w-12" /> : <Users className="h-12 w-12" />}
            </div>
          </div>}
        
        {/* Privacy indicator overlay */}
        
      </div>

      {/* Separating stroke */}
      <div className="h-px bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100"></div>

      {/* Content Section with increased padding */}
      <CardContent className="p-6 space-y-4">
        {/* Title with larger, bolder text */}
        <h3 className="font-bold text-xl text-gray-900 leading-tight">
          {group.name}
        </h3>
        
        {/* Description with improved contrast and readability */}
        {group.description && <p className="text-base text-gray-800 line-clamp-2 leading-relaxed">
            {group.description}
          </p>}

        {/* Member Profile Stack */}
        <div className="pt-1">
          {renderMemberStack()}
        </div>

        {/* Join/Leave Button with better sizing */}
        {showJoinButton && <div className="pt-3">
            <Button 
              size="lg" 
              className={
                group.current_user_membership && showLeaveConfirm
                  ? "w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base py-3"
                  : group.current_user_membership 
                    ? "w-full bg-white hover:bg-red-50 border-2 font-bold text-base py-3 hover:border-red-300" 
                    : "w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-base py-3"
              }
              style={group.current_user_membership && !showLeaveConfirm ? {
                color: showLeaveConfirm ? '#dc2626' : 'hsl(var(--neighbors-color))',
                borderColor: showLeaveConfirm ? '#dc2626' : 'hsl(var(--neighbors-color))'
              } : {}}
              onClick={handleButtonClick}
              disabled={joinGroupMutation.isPending || leaveGroupMutation.isPending}
              onMouseLeave={() => {
                // Reset leave confirmation when mouse leaves if not clicked yet
                if (group.current_user_membership && showLeaveConfirm && !leaveGroupMutation.isPending) {
                  setShowLeaveConfirm(false);
                }
              }}
            >
              {joinGroupMutation.isPending 
                ? 'Joining...'
                : leaveGroupMutation.isPending
                  ? 'Leaving...'
                  : group.current_user_membership 
                    ? (showLeaveConfirm ? 'Leave Group' : 'Joined')
                    : group.is_private 
                      ? 'Request to Join' 
                      : 'Join Group'
              }
            </Button>
          </div>}
      </CardContent>
    </Card>;
};
export default GroupCard;