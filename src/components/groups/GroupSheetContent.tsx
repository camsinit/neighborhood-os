import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { Users, Lock, Globe, Plus, Edit, MessageSquare, User } from 'lucide-react';
import { Group } from '@/types/groups';
import { useJoinGroup, useLeaveGroup, useGroupMembers } from '@/hooks/useGroups';
import { useGroupActivities } from '@/hooks/useGroupActivities';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import AddEventDialog from '@/components/AddEventDialog';
import { EditGroupForm } from './EditGroupForm';
import { GroupActivityTimeline } from './activity/GroupActivityTimeline';

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
  // State for current user and membership status
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
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

  // Function to close the sheet and propagate to parent component
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  return <>
      <AppSheetContent moduleTheme="neighbors" className="overflow-y-auto">
        {/* Edit button for group owners/moderators - positioned absolutely for easy access */}
        {canEditGroup && <button onClick={() => setIsEditGroupOpen(true)} className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors" aria-label="Edit group">
            <Edit className="h-4 w-4" />
          </button>}

        <div className="space-y-6 pt-6">
          {/* Banner Image (if available) - provides visual appeal and group branding */}
          {group.banner_image_url && <div className="h-48 rounded-lg overflow-hidden">
              <img src={group.banner_image_url} alt={`${group.name} banner`} className="w-full h-full object-cover" />
            </div>}

          {/* Group Header Section - Main group information display */}
          <div className="space-y-4">
            {/* Top row: Group name and privacy status indicator */}
            
            
            {/* Privacy status and member count with profile images */}
            <div className="flex items-center gap-2 text-gray-600">
              {/* Profile images on the left */}
              <div className="flex -space-x-1">
                {memberAvatars.slice(0, 3).map((member, index) => (
                  <Avatar key={member.user_id} className="h-5 w-5 border border-white">
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
              <span className="text-sm">
                {group.is_private ? 'Private group' : 'Public group'} • {group.member_count || 0} members
              </span>
            </div>

            {/* Action buttons section */}
            <div className="flex items-center justify-between">
              {/* Right side: Action buttons - contextual based on membership status */}
              <div className="flex items-center gap-3">
                {currentUserId && <>
                    {/* Dynamic button: Join if not member, Invite if member */}
                    <Button onClick={isUserMember ? undefined : handleJoinGroup} disabled={!isUserMember && joinGroupMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                      {isUserMember ? <>
                          <Plus className="h-4 w-4" />
                          Invite
                        </> : <>
                          {joinGroupMutation.isPending ? 'Joining...' : 'Join'}
                        </>}
                    </Button>
                    
                    {/* Share button - only show for members */}
                    {isUserMember && <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Share
                      </Button>}
                  </>}
                
                {/* Leave option for members (but not owners) - prevent owners from leaving their groups */}
                {currentUserId && isUserMember && memberRole !== 'owner' && <Button variant="ghost" size="sm" onClick={handleLeaveGroup} disabled={leaveGroupMutation.isPending} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    Leave
                  </Button>}
              </div>
            </div>
          </div>

          {/* Group Activity Timeline - Shows events and updates */}
          {isUserMember && (
            <GroupActivityTimeline 
              groupId={group.id}
              isGroupManager={canEditGroup}
              onCreateEvent={() => setIsCreateEventOpen(true)}
            />
          )}

          {/* Group Info Section - Shows creation date and creator information */}
          <div className="text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span>Created {formatDate(group.created_at)}</span>
              {group.created_by_profile && <span>by {group.created_by_profile.display_name}</span>}
            </div>
          </div>
        </div>
      </AppSheetContent>

      {/* Create Event Dialog - Allows members to create events for the group */}
      <AddEventDialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen} onAddEvent={() => {
      setIsCreateEventOpen(false);
      // Refresh the group activities after event creation
      queryClient.invalidateQueries({
        queryKey: ['activities']
      });
    }} initialDate={null}
    // Pre-populate with group information for convenience
    initialValues={{
      groupId: group.id
    }} />

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