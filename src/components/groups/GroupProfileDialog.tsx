import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Users, 
  MapPin, 
  Lock, 
  Globe, 
  Calendar, 
  Plus, 
  MessageSquare,
  User,
  Check 
} from 'lucide-react';
import { Group } from '@/types/groups';
import { useJoinGroup, useLeaveGroup, useGroupMembers } from '@/hooks/useGroups';
import { useGroupActivities } from '@/hooks/useGroupActivities';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import AddEventDialog from '@/components/AddEventDialog';
import { GroupUpdateFeed } from './updates/GroupUpdateFeed';

interface GroupProfileDialogProps {
  group: Group | null;
  onClose: () => void;
}

/**
 * GroupProfileDialog Component
 * 
 * Displays detailed group information including members, timeline, and actions.
 * Similar to NeighborProfileDialog but focused on group data and interactions.
 * Includes functionality for joining/leaving groups and creating content for members.
 */
export const GroupProfileDialog = ({ group, onClose }: GroupProfileDialogProps) => {
  // State for current user and membership status
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isPostUpdateOpen, setIsPostUpdateOpen] = useState(false);
  
  // Group data hooks
  const { data: groupMembers } = useGroupMembers(group?.id || '');
  const { data: activities } = useGroupActivities(group?.id || '');
  
  // Group action hooks
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const queryClient = useQueryClient();

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  if (!group) return null;

  // Check if current user is a member
  const isUserMember = group.current_user_membership !== undefined;
  const memberRole = group.current_user_membership?.role;

  // Handle joining the group
  const handleJoinGroup = async () => {
    if (!currentUserId) return;
    try {
      await joinGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  // Handle leaving the group
  const handleLeaveGroup = async () => {
    if (!currentUserId) return;
    try {
      await leaveGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  // Create member avatar stack (first 5 members + count)
  const memberAvatars = groupMembers?.slice(0, 5) || [];
  const additionalMemberCount = Math.max(0, (group.member_count || 0) - 5);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={!!group} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {group.name} Group Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Banner Image (if available) */}
            {group.banner_image_url && (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={group.banner_image_url} 
                  alt={`${group.name} banner`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Group Header - Redesigned to match reference image */}
            <div className="space-y-4">
              {/* Top row: Group name and privacy status */}
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                {group.is_private ? (
                  <Lock className="h-5 w-5 text-gray-400" />
                ) : (
                  <Globe className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              {/* Privacy status and member count on second line */}
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm">
                  {group.is_private ? 'Private group' : 'Public group'} • {group.member_count || 0} members
                </span>
              </div>

              {/* Bottom row: Member avatars on left, action buttons on right */}
              <div className="flex items-center justify-between">
                {/* Left side: Member avatar stack */}
                <div className="flex -space-x-2">
                  {memberAvatars.map((member, index) => (
                    <Avatar key={member.user_id} className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={member.profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {additionalMemberCount > 0 && (
                    <div className="h-10 w-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{additionalMemberCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center gap-3">
                  {currentUserId && isUserMember && (
                    <>
                      {/* Invite button */}
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Invite
                      </Button>
                      
                      {/* Share button */}
                      <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Share
                      </Button>
                    </>
                  )}
                  
                  {/* Join button for non-members */}
                  {currentUserId && !isUserMember && (
                    <Button
                      onClick={handleJoinGroup}
                      disabled={joinGroupMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                    </Button>
                  )}
                  
                  {/* Leave option for members (but not owners) */}
                  {currentUserId && isUserMember && memberRole !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLeaveGroup}
                      disabled={leaveGroupMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons (for members only) */}
            {isUserMember && (
              <div className="flex gap-2 py-4 border-y border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setIsPostUpdateOpen(true)}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateEventOpen(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}

            {/* Group Updates Feed - Simplified UI */}
            {isUserMember && (
              <GroupUpdateFeed 
                groupId={group.id} 
                isGroupManager={memberRole === 'owner' || memberRole === 'moderator'} 
              />
            )}

            {/* Group Info */}
            <div className="text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span>Created {formatDate(group.created_at)}</span>
                {group.created_by_profile && (
                  <span>by {group.created_by_profile.display_name}</span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <AddEventDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onAddEvent={() => {
          setIsCreateEventOpen(false);
          // Refresh the group activities after event creation
          queryClient.invalidateQueries({ queryKey: ['activities'] });
        }}
        initialDate={null}
        // Pre-populate with group information
        initialValues={{
          groupId: group.id
        }}
      />

      {/* Post Update Sheet - TODO: Implement when update posting is available */}
      {isPostUpdateOpen && (
        <Sheet open={isPostUpdateOpen} onOpenChange={setIsPostUpdateOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Post Group Update</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <p className="text-gray-500">Update posting functionality coming soon...</p>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};