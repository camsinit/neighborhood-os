/**
 * GroupUpdateFeed Component
 * 
 * Main feed component that displays group updates and events.
 * Supports toggling between updates and events views.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageSquare, Calendar, X } from 'lucide-react';
import { GroupUpdateCard } from './GroupUpdateCard';
import { CreateGroupUpdateForm } from './CreateGroupUpdateForm';
import EventCard from '@/components/EventCard';
import AddEventDialog from '@/components/AddEventDialog';
import { GroupUpdateWithComments } from '@/types/groupUpdates';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GroupUpdateFeed');

interface GroupUpdateFeedProps {
  groupId: string;
  isGroupManager: boolean;
  className?: string;
}

export function GroupUpdateFeed({ groupId, isGroupManager, className = '' }: GroupUpdateFeedProps) {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // Fetch group updates
  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ['group-updates', groupId],
    queryFn: async (): Promise<GroupUpdateWithComments[]> => {
      logger.debug('Fetching group updates for group:', groupId);
      
      const { data, error } = await supabase
        .from('group_updates')
        .select(`
          id,
          group_id,
          user_id,
          title,
          content,
          image_urls,
          created_at,
          updated_at,
          edited_by,
          is_deleted
        `)
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching group updates:', error);
        throw error;
      }

      // Fetch profiles for all updates
      const updateUserIds = (data || []).map(u => u.user_id);
      const { data: updateProfiles = [] } = updateUserIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', updateUserIds) : { data: [] };

      // For each update, fetch comments and reactions
      const updatesWithComments = await Promise.all(
        (data || []).map(async (update) => {
          // Fetch comments
          const { data: comments = [] } = await supabase
            .from('group_update_comments')
            .select(`
              id,
              update_id,
              user_id,
              content,
              created_at,
              updated_at,
              edited_by,
              is_deleted
            `)
            .eq('update_id', update.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

          // Fetch profiles for comments separately
          const commentUserIds = comments.map(c => c.user_id);
          const { data: commentProfiles = [] } = commentUserIds.length > 0 ? await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', commentUserIds) : { data: [] };

          // Fetch reactions
          const { data: reactions = [] } = await supabase
            .from('group_update_reactions')
            .select(`
              id,
              update_id,
              user_id,
              emoji,
              created_at
            `)
            .eq('update_id', update.id);

          // Fetch profiles for reactions separately
          const reactionUserIds = reactions.map(r => r.user_id);
          const { data: reactionProfiles = [] } = reactionUserIds.length > 0 ? await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', reactionUserIds) : { data: [] };

          // Merge comments with profiles
          const commentsWithProfiles = comments.map(comment => ({
            ...comment,
            profiles: commentProfiles.find(p => p.id === comment.user_id)
          }));

          // Merge reactions with profiles  
          const reactionsWithProfiles = reactions.map(reaction => ({
            ...reaction,
            profiles: reactionProfiles.find(p => p.id === reaction.user_id)
          }));

          // Calculate reaction summary
          const reactionSummary = reactionsWithProfiles.reduce((acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          }, {} as { [emoji: string]: number });

          return {
            ...update,
            // Ensure title field exists (fallback for old data)
            title: update.title || update.content.slice(0, 25),
            profiles: updateProfiles.find(p => p.id === update.user_id),
            comments: commentsWithProfiles || [],
            reactions: reactionsWithProfiles || [],
            commentCount: commentsWithProfiles?.length || 0,
            reactionSummary
          };
        })
      );

      return updatesWithComments;
    },
    enabled: !!groupId && !!user,
  });

  // Fetch group events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['group-events', groupId],
    queryFn: async () => {
      logger.debug('Fetching group events for group:', groupId);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_host_id_fkey (display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('is_archived', false)
        .order('time', { ascending: true });

      if (error) {
        logger.error('Error fetching group events:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!groupId && !!user,
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; image_urls?: string[] }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_updates')
        .insert({
          group_id: groupId,
          user_id: user.id,
          title: data.title, // Title is now required from the form
          content: data.content,
          image_urls: data.image_urls || []
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-updates', groupId] });
      setShowCreateForm(false);
      toast({
        title: "Update posted",
        description: "Your update has been shared with the group",
      });
    },
    onError: (error) => {
      logger.error('Error creating group update:', error);
      toast({
        title: "Error posting update",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // React to update mutation
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
        // Remove reaction
        const { error } = await supabase
          .from('group_update_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (error) throw error;
      } else {
        // Add reaction
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
      queryClient.invalidateQueries({ queryKey: ['group-updates', groupId] });
    },
    onError: (error) => {
      logger.error('Error reacting to update:', error);
      toast({
        title: "Error adding reaction",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
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
      queryClient.invalidateQueries({ queryKey: ['group-updates', groupId] });
    },
    onError: (error) => {
      logger.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Create update form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Update</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupUpdateForm
              groupId={groupId}
              onSubmit={(data) => createUpdateMutation.mutateAsync(data)}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createUpdateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Combined activity feed */}
      {updatesLoading || eventsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : updates.length > 0 || events.length > 0 ? (
        <div className="space-y-4">
          {/* Show updates */}
          {updates.map((update) => (
            <GroupUpdateCard
              key={`update-${update.id}`}
              update={update}
              currentUserId={user.id}
              isGroupManager={isGroupManager}
              onReact={async (updateId, emoji) => {
                reactMutation.mutate({ updateId, emoji });
              }}
              onComment={async (updateId, content) => {
                commentMutation.mutate({ updateId, content });
              }}
            />
          ))}
          
          {/* Show events */}
          {events.map((event) => (
            <EventCard
              key={`event-${event.id}`}
              event={event}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No updates yet. Be the first to share something with your group!</p>
        </div>
      )}

      {/* Create Event Dialog */}
      <AddEventDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onAddEvent={() => {
          // Refetch events after creation
          queryClient.invalidateQueries({ queryKey: ['group-events', groupId] });
        }}
        initialValues={{ groupId }}
      />
    </div>
  );
}