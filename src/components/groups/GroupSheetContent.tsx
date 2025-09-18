import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { Users, Lock, Globe, Plus, Edit, MessageSquare, User, X } from 'lucide-react';
import { Group } from '@/types/groups';
import { useJoinGroup, useLeaveGroup, useGroupMembers } from '@/hooks/useGroups';
import { useGroupActivities } from '@/hooks/useGroupActivities';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import AddEventDialog from '@/components/AddEventDialog';
import { EditGroupForm } from './EditGroupForm';
import { GroupActivityTimeline } from './activity/GroupActivityTimeline';
import { CreateGroupUpdate } from './activity/CreateGroupUpdate';

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
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  
  // State for content view - determines what to show in the sheet
  const [currentView, setCurrentView] = useState<'group' | 'create-event' | 'create-update'>('group');

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

  // Functions to handle view switching
  const handleCreateEvent = () => {
    setCurrentView('create-event');
  };

  const handleCreateUpdate = () => {
    setCurrentView('create-update');
  };

  const handleBackToGroup = () => {
    setCurrentView('group');
  };

  const handleEventCreated = () => {
    setCurrentView('group');
    // Refresh the group activities after event creation
    queryClient.invalidateQueries({
      queryKey: ['activities']
    });
  };

  const handleUpdateCreated = () => {
    setCurrentView('group');
    // Refresh the group activities after update creation
    queryClient.invalidateQueries({
      queryKey: ['group-timeline', group.id]
    });
  };
  return <>
      <AppSheetContent moduleTheme="neighbors" className="overflow-y-auto relative">
        {/* Main Group View */}
        {currentView === 'group' && (
          <div className="space-y-6 pt-6">
            {/* Banner Image (if available) - provides visual appeal and group branding */}
            {group.banner_image_url && (
              <div className="h-48 rounded-lg overflow-hidden">
                <img src={group.banner_image_url} alt={`${group.name} banner`} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Group Header Section - Main group information display */}
            <div className="space-y-4">
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
                <span className="text-sm text-gray-600">
                  {group.member_count || 0} members
                </span>
                <span className="text-sm text-gray-600">
                  {group.is_private ? 'Private group' : 'Public group'}
                </span>
                
                {/* Edit button for group owners/moderators */}
                {canEditGroup && (
                  <button 
                    onClick={() => setIsEditGroupOpen(true)} 
                    className="ml-auto p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors" 
                    aria-label="Edit group"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Group Activity Timeline - Shows events and updates */}
            {isUserMember && (
              <GroupActivityTimeline 
                groupId={group.id}
                isGroupManager={canEditGroup}
                onCreateEvent={handleCreateEvent}
                onCreateUpdate={handleCreateUpdate}
                showInviteButton={isUserMember}
                onInvite={() => {/* TODO: Add invite functionality */}}
              />
            )}
          </div>
        )}

        {/* Create Event View - Replaces entire content */}
        {currentView === 'create-event' && (
          <div className="absolute inset-0 bg-background">
            {/* Header with back button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create Event</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToGroup}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Event creation form content - simplified for inline display */}
            <div className="p-4">
              <p className="text-gray-500 text-center">Event creation form will be embedded here</p>
              <Button onClick={handleBackToGroup} className="mt-4 w-full">
                Back to Group
              </Button>
            </div>
          </div>
        )}

        {/* Create Update View - Replaces entire content */}
        {currentView === 'create-update' && (
          <CreateGroupUpdate
            groupId={group.id}
            onClose={handleBackToGroup}
            onSuccess={handleUpdateCreated}
          />
        )}
      </AppSheetContent>

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