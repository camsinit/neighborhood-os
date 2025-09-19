/**
 * GroupUpdateSheetContent Component
 * 
 * Sheet content for viewing group updates with comments interface
 * Similar to SafetySheetContent but for group updates
 */

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, MessageSquare, User, Calendar } from 'lucide-react';
import { GroupUpdateComments } from './GroupUpdateComments';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { GroupUpdate } from '@/types/groupUpdates';

interface GroupUpdateSheetContentProps {
  update: GroupUpdate;
  onOpenChange: (open: boolean) => void;
}

/**
 * GroupUpdateSheetContent Component
 * 
 * Enhanced sheet content for viewing group updates with sophisticated styling
 * that matches the neighbor directory and safety update design patterns
 */
const GroupUpdateSheetContent = ({ update, onOpenChange }: GroupUpdateSheetContentProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Groups theme colors for consistency
  const groupsTheme = moduleThemeColors.neighbors;
  
  // Fetch comments for this update
  const { data: comments = [] } = useQuery({
    queryKey: ['group-update-comments', update.id],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('group_update_comments')
        .select('*')
        .eq('update_id', update.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        return [];
      }

      // Get profiles for comment authors
      const userIds = commentsData.map(comment => comment.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map comments with their profiles
      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profiles: profiles?.find(p => p.id === comment.user_id)
      }));

      return commentsWithProfiles || [];
    },
    enabled: !!update.id
  });

  // Comment mutation - properly handles both updateId and content parameters
  const commentMutation = useMutation({
    mutationFn: async ({ updateId, content }: { updateId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_update_comments')
        .insert({
          update_id: updateId,
          user_id: user.id,
          content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['group-update-comments', update.id] });
      // Also invalidate group updates to update comment counts
      queryClient.invalidateQueries({ queryKey: ['group-updates', update.group_id] });
      queryClient.invalidateQueries({ queryKey: ['group-activities'] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // React mutation for reactions on updates
  const reactMutation = useMutation({
    mutationFn: async ({ updateId, emoji }: { updateId: string; emoji: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if user already reacted with this emoji
      const { data: existingReaction } = await supabase
        .from('group_update_reactions')
        .select('id')
        .eq('update_id', updateId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('group_update_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (error) throw error;
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('group_update_reactions')
          .insert({
            update_id: updateId,
            user_id: user.id,
            emoji
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-updates', update.group_id] });
      queryClient.invalidateQueries({ queryKey: ['group-activities'] });
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error adding reaction",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });
  
  /**
   * Handle delete functionality with proper error handling
   */
  const handleDelete = async () => {
    if (!user || user.id !== update.user_id) return;
    
    setIsDeleting(true);
    try {
      // Soft delete by setting is_deleted flag
      const { error } = await supabase
        .from('group_updates')
        .update({ is_deleted: true })
        .eq('id', update.id);

      if (error) throw error;

      toast({
        title: "Update deleted",
        description: "The group update has been removed.",
      });

      // Invalidate queries and close sheet
      queryClient.invalidateQueries({ queryKey: ['group-activities'] });
      queryClient.invalidateQueries({ queryKey: ['group-updates'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting group update:', error);
      toast({
        title: "Error",
        description: "Failed to delete the group update. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Format time ago in simplified format (2hr, 5d, etc.)
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}hr`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
  };

  const isCurrentUser = user?.id === update.user_id;

  /**
   * Main view with enhanced styling matching safety updates
   */
  return (
    <SheetContent side="right" className="w-full sm:max-w-md p-0">
      <div className="h-full flex flex-col">
        {/* Enhanced header section with gradient background */}
        <div 
          className="relative p-6"
          style={{
            background: `linear-gradient(135deg, ${groupsTheme.primary}08 0%, ${groupsTheme.primary}03 50%, white 100%)`
          }}
        >
          {/* Enhanced author section with comprehensive information */}
          <div 
            className="p-6 rounded-xl border-2 relative"
            style={{
              background: `linear-gradient(135deg, ${groupsTheme.primary}08 0%, ${groupsTheme.primary}03 50%, white 100%)`,
              borderColor: `${groupsTheme.primary}20`
            }}
          >
            {/* Author info in top right corner */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {/* TODO: Get actual author name from profiles */}
                Author
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {/* TODO: Get actual author initials */}
                  A
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Title with time on the left */}
            <div className="flex items-start gap-4 mb-3 pr-20"> {/* pr-20 to avoid overlap with author info */}
              <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatTimeAgo(new Date(update.created_at))}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {update.title}
                </h1>
                {/* Description */}
                {update.content && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {update.content}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Content section with improved styling */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6 space-y-6">
            {/* Images section */}
            {update.image_urls && update.image_urls.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div 
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: groupsTheme.primary }}
                  />
                  Images
                </h3>
                <div className="grid gap-3">
                  {update.image_urls.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt={`Update image ${index + 1}`}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="space-y-4">
              <GroupUpdateComments 
                updateId={update.id}
                comments={comments}
                currentUserId={user?.id || ''}
                isGroupManager={false} // TODO: Pass actual group manager status
                onComment={async (updateId, content) => {
                  commentMutation.mutate({ updateId, content });
                }}
                onReact={async (updateId, emoji) => {
                  reactMutation.mutate({ updateId, emoji });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

export default GroupUpdateSheetContent;