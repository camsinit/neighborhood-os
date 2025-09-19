import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { Users, Lock, Globe, Plus, Edit, MessageSquare, User, Share2 } from 'lucide-react';
import { Group } from '@/types/groups';
import { useJoinGroup, useLeaveGroup, useGroupMembers } from '@/hooks/useGroups';
import { useGroupActivities } from '@/hooks/useGroupActivities';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { EditGroupForm } from './EditGroupForm';
import { GroupActivityTimeline } from './activity/GroupActivityTimeline';
import { extractNeighborhoodId, neighborhoodPath, BASE_ROUTES } from '@/utils/routes';

/**
 * GroupSheetContent Component
 * 
 * Universal side-panel component for displaying detailed group information.
 * Follows the established pattern used by NeighborSheetContent and other modules.
 * 
 * Features:
 * - Clean white background with groups module theming
 * - Banner image display
 * - Member avatar stack with count
 * - Join/Leave functionality with proper state management
 * - Action buttons for group members (create events, post updates)
 * - Edit functionality for group owners/moderators
 * - Proper loading states and error handling
 * - Responsive design that works on mobile and desktop
 */
interface GroupSheetContentProps {
  group: Group;
  onOpenChange?: (open: boolean) => void;
}
const GroupSheetContent = ({
  group,
  onOpenChange
}: GroupSheetContentProps) => {
  // Navigation hook for routing to Calendar page
  const navigate = useNavigate();
  
  // State for current user and membership status
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPostUpdateOpen, setIsPostUpdateOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  // Group data hooks - fetch members and activities for this group
  const {
    data: groupMembers
  } = useGroupMembers(group?.id || '');
  const {
    data: activities
  } = useGroupActivities(group?.id || '');

  // Group action hooks - for joining/leaving groups with optimistic updates
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const queryClient = useQueryClient();

  // Get current user on mount to determine membership status and permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);
  if (!group) return null;

  // Check if current user is a member and their role for permission-based UI
  const isUserMember = group.current_user_membership !== undefined;
  const memberRole = group.current_user_membership?.role;
  const canEditGroup = memberRole === 'owner' || memberRole === 'moderator';

  // Handle joining the group with proper error handling
  const handleJoinGroup = async () => {
    if (!currentUserId) return;
    try {
      await joinGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  // Handle leaving the group with proper error handling
  const handleLeaveGroup = async () => {
    if (!currentUserId) return;
    try {
      await leaveGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  // Create member avatar stack (first 5 members + count) for visual member representation
  const memberAvatars = groupMembers?.slice(0, 5) || [];
  const additionalMemberCount = Math.max(0, (group.member_count || 0) - 5);

  // Format date helper for consistent date display throughout the component
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle creating events by navigating to Calendar page with pre-selected group
  const handleCreateEvent = (groupId: string) => {
    const neighborhoodId = extractNeighborhoodId();
    const calendarPath = neighborhoodPath(BASE_ROUTES.calendar, neighborhoodId);
    navigate(`${calendarPath}?action=add_event&groupId=${groupId}`);
  };

  // Function to close the sheet and propagate to parent component
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  return <>
      <AppSheetContent moduleTheme="neighbors" className="overflow-y-auto">

        <div className="space-y-6 pt-6">
          {/* Banner Image (if available) - provides visual appeal and group branding */}
          {group.banner_image_url && <div className="h-48 rounded-lg overflow-hidden">
              <img src={group.banner_image_url} alt={`${group.name} banner`} className="w-full h-full object-cover" />
            </div>}

          {/* Group Header Section - Main group information display */}
          <div className="space-y-4">
            {/* Prominent Group Title */}
            <h1 className="text-2xl font-bold text-foreground">
              {group.name}
            </h1>
            
            {/* Privacy status and member count with profile images */}
            <div className="flex items-center gap-2 text-gray-600">
              {/* Profile images on the left */}
              <div className="flex -space-x-1">
                {memberAvatars.slice(0, 3).map((member, index) => (
                  <Avatar key={member.user_id} className="h-10 w-10 border border-white">
                    <AvatarImage src={member.profile?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {member.profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {additionalMemberCount > 0 && (
                  <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{additionalMemberCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {group.is_private ? (
                  <>🔒 Private group • {group.member_count === 1 ? '1 neighbor' : `${group.member_count || 0} neighbors`}</>
                ) : (
                  <>🌐 Public group • {group.member_count === 1 ? '1 neighbor' : `${group.member_count || 0} neighbors`}</>
                )}
              </span>
              
              {/* Action buttons container */}
              <div className="ml-auto flex items-center gap-2">
                {/* Share button - visible to all users */}
                <button 
                  onClick={() => {
                    // Copy group URL to clipboard
                    const groupUrl = `${window.location.origin}/n/${group.neighborhood_id}/neighbors?detail=${group.id}&type=group`;
                    navigator.clipboard.writeText(groupUrl);
                    // TODO: Add toast notification for successful copy
                  }} 
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors" 
                  aria-label="Share group"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                
                {/* Edit button for group owners/moderators */}
                {canEditGroup && (
                  <button 
                    onClick={() => setIsEditGroupOpen(true)} 
                  className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                    aria-label="Edit group"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Horizontal Separator Line */}
          {isUserMember && (
            <hr className="border-t border-gray-200" />
          )}

          {/* Group Activity Timeline - Shows events and updates */}
          {isUserMember && (
            <GroupActivityTimeline 
              groupId={group.id}
              isGroupManager={canEditGroup}
              onCreateEvent={handleCreateEvent}
              showInviteButton={isUserMember}
              onInvite={() => {/* TODO: Add invite functionality */}}
            />
          )}

        </div>
      </AppSheetContent>


      {/* Post Update Sheet - TODO: Implement when update posting is available */}
      {isPostUpdateOpen && <Sheet open={isPostUpdateOpen} onOpenChange={setIsPostUpdateOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Post Group Update</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <p className="text-gray-500">Update posting functionality coming soon...</p>
            </div>
          </SheetContent>
        </Sheet>}

      {/* Edit Group Sheet - Allows owners/moderators to edit group details */}
      {isEditGroupOpen && <Sheet open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold">
                Edit Group
              </SheetTitle>
            </SheetHeader>
            <EditGroupForm onClose={() => setIsEditGroupOpen(false)} group={group} />
          </SheetContent>
        </Sheet>}
    </>;
};
export default GroupSheetContent;