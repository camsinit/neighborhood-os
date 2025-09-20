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
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GroupActivityItem } from '@/types/groupActivityTypes';
import { GroupActivityCard } from './GroupActivityCard';
import { InlineUpdateForm } from './InlineUpdateForm';
import { GroupEventDetail } from './GroupEventDetail';
import { GroupViewTabs, GroupViewType } from './GroupViewTabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { extractNeighborhoodId, neighborhoodPath, BASE_ROUTES } from '@/utils/routes';
import GroupUpdateSheetContent from '../updates/GroupUpdateSheetContent';
import { GroupUpdate } from '@/types/groupUpdates';

interface GroupActivityTimelineProps {
  groupId: string;
  isGroupManager: boolean;
  onCreateEvent: (groupId: string) => void; // Pass groupId to handler
  showInviteButton?: boolean;
  onInvite?: () => void;
}

export const GroupActivityTimeline: React.FC<GroupActivityTimelineProps> = ({
  groupId,
  isGroupManager,
  onCreateEvent,
  showInviteButton = false,
  onInvite
}) => {
  // Navigation hook for routing to Calendar page
  const navigate = useNavigate();
  
  // Extract neighborhood ID from current location for navigation
  const neighborhoodId = extractNeighborhoodId(window.location.pathname);
  
  // Component state for overlays, detail panels, and view type
  const [isCreateUpdateOpen, setIsCreateUpdateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<GroupUpdate | null>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [activeView, setActiveView] = useState<GroupViewType>('timeline'); // Always default to timeline

  // Fetch unified group activities (events + updates + group start)
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['group-timeline', groupId],
    queryFn: async (): Promise<GroupActivityItem[]> => {
      const items: GroupActivityItem[] = [];

      // First, fetch group creation info for the "Group Start" card
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          created_at,
          created_by
        `)
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group data:', groupError);
      } else if (groupData) {
        // Fetch creator profile separately
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', groupData.created_by)
          .single();

        // Add the group start card
        items.push({
          id: `group-start-${groupData.id}`,
          type: 'group_start',
          title: `${groupData.name} was created`,
          created_at: groupData.created_at,
          user_id: groupData.created_by,
          profiles: creatorProfile,
          group: groupData
        });
      }

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

  // Handle update detail panel
  const handleUpdateClick = async (updateId: string) => {
    // Find the update from the activities list
    const updateActivity = activities.find(activity => 
      activity.type === 'update' && activity.update?.id === updateId
    );
    
    if (updateActivity?.update) {
      setSelectedUpdate(updateActivity.update);
      setIsUpdateSheetOpen(true);
    }
  };

  const handleCloseUpdateSheet = () => {
    setSelectedUpdate(null);
    setIsUpdateSheetOpen(false);
  };

  // Filter activities based on current view
  const getFilteredActivities = () => {
    switch (activeView) {
      case 'updates':
        return activities.filter(activity => activity.type === 'update');
      case 'events':
        return activities.filter(activity => activity.type === 'event');
      case 'timeline':
      default:
        return activities;
    }
  };

  const filteredActivities = getFilteredActivities();

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
      {/* View Tabs */}
      <GroupViewTabs activeView={activeView} onViewChange={setActiveView}>
        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={handleCreateUpdate}
            className="flex-1 h-10"
            variant="outline"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
            New Update
          </Button>
          
          <Button
            onClick={() => onCreateEvent(groupId)}
            className="flex-1 h-10"
            variant="outline"
          >
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Add a Gathering
          </Button>
        </div>

        {/* Inline Update Form */}
        {isCreateUpdateOpen && (
          <InlineUpdateForm
            groupId={groupId}
            onClose={handleCloseCreateUpdate}
            onSuccess={() => {
              setIsCreateUpdateOpen(false);
              // Refetch will happen automatically due to real-time subscriptions
            }}
          />
        )}

        {/* Filtered Timeline Content */}
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline connector line (except for last item) */}
              {index < filteredActivities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
              )}
              
                <GroupActivityCard
                  activity={activity}
                  neighborhoodId={neighborhoodId || ''}
                  onClick={() => {
                    if (activity.type === 'event' && activity.event) {
                      handleEventClick(activity.event.id);
                    } else if (activity.type === 'update' && activity.update) {
                      // Open update detail sheet
                      handleUpdateClick(activity.update.id);
                    }
                  }}
                />
            </div>
          ))}
        </div>
      </GroupViewTabs>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <GroupEventDetail
          eventId={selectedEvent}
          onClose={handleCloseEventDetail}
        />
      )}


      {/* Update Detail Sheet */}
      {isUpdateSheetOpen && selectedUpdate && (
        <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
          <GroupUpdateSheetContent
            update={selectedUpdate}
            onOpenChange={handleCloseUpdateSheet}
          />
        </Sheet>
      )}
    </div>
  );
};