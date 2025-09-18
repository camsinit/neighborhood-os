/**
 * Group Activity Timeline Component
 * 
 * Displays a vertical timeline of group events and updates with:
 * - Chronological ordering (newest first)
 * - Visual distinction between events and updates
 * - Create buttons for new content
 * - Expandable overlay for creating updates
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GroupActivityItem } from '@/types/groupActivityTypes';
import { GroupActivityCard } from './GroupActivityCard';
import { CreateGroupUpdate } from './CreateGroupUpdate';
import { GroupEventDetail } from './GroupEventDetail';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface GroupActivityTimelineProps {
  groupId: string;
  isGroupManager: boolean;
  onCreateEvent: () => void;
  onCreateUpdate?: () => void;
  showInviteButton?: boolean;
  onInvite?: () => void;
}

export const GroupActivityTimeline: React.FC<GroupActivityTimelineProps> = ({
  groupId,
  isGroupManager,
  onCreateEvent,
  onCreateUpdate,
  showInviteButton = false,
  onInvite
}) => {
  // Component state for overlays and detail panels
  const [isCreateUpdateOpen, setIsCreateUpdateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Fetch unified group activities (events + updates)
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['group-timeline', groupId],
    queryFn: async (): Promise<GroupActivityItem[]> => {
      const items: GroupActivityItem[] = [];

      // Fetch group events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          time,
          location,
          host_id,
          group_id,
          neighborhood_id,
          created_at,
          profiles:host_id (
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching group events:', eventsError);
      } else if (events) {
        events.forEach(event => {
          items.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            created_at: event.created_at,
            user_id: event.host_id,
            profiles: event.profiles,
            event: event
          });
        });
      }

      // Fetch group updates
      const { data: updates, error: updatesError } = await supabase
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

      if (updatesError) {
        console.error('Error fetching group updates:', updatesError);
      } else if (updates) {
        // Get user profiles for updates
        const userIds = [...new Set(updates.map(update => update.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        updates.forEach(update => {
          const userProfile = profiles?.find(p => p.id === update.user_id);
          items.push({
            id: `update-${update.id}`,
            type: 'update',
            title: update.title,
            created_at: update.created_at,
            user_id: update.user_id,
            profiles: userProfile,
            update: update
          });
        });
      }

      // Sort all activities by creation date (newest first)
      return items.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!groupId,
  });

  // Handle create update overlay
  const handleCreateUpdate = () => {
    setIsCreateUpdateOpen(true);
  };

  const handleCloseCreateUpdate = () => {
    setIsCreateUpdateOpen(false);
  };

  // Handle event detail panel
  const handleEventClick = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleCloseEventDetail = () => {
    setSelectedEvent(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load group activity</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Create Update Overlay */}
      {isCreateUpdateOpen && (
        <CreateGroupUpdate
          groupId={groupId}
          onClose={handleCloseCreateUpdate}
          onSuccess={() => {
            setIsCreateUpdateOpen(false);
            // Refetch will happen automatically due to real-time subscriptions
          }}
        />
      )}

      {/* Action Buttons */}
      {!isCreateUpdateOpen && (
        <div className="flex gap-2 mb-6">
          <Button
            onClick={onCreateUpdate || handleCreateUpdate}
            className="flex-1 h-10"
            variant="outline"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
            New Update
          </Button>
          
          <Button
            onClick={onCreateEvent}
            className="flex-1 h-10"
            variant="outline"
          >
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            New Event
          </Button>

          {showInviteButton && (
            <Button
              onClick={onInvite}
              className="flex-1 h-10 bg-purple-100/50 text-purple-600 border-purple-600 hover:bg-purple-50"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share an update or create an event!
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline connector line (except for last item) */}
              {index < activities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
              )}
              
              <GroupActivityCard
                activity={activity}
                onClick={() => {
                  if (activity.type === 'event' && activity.event) {
                    handleEventClick(activity.event.id);
                  }
                  // For updates, they can be handled in the card component
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <GroupEventDetail
          eventId={selectedEvent}
          onClose={handleCloseEventDetail}
        />
      )}
    </div>
  );
};