/**
 * Group Activities Hook
 * 
 * Fetches and manages activities specific to a group, including:
 * - Group events (events created for this group)
 * - Group updates (posts, announcements)
 * - Real-time updates for group activity changes
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Activity } from "@/utils/queries/activities/types";
import { GroupUpdate } from "@/types/groupUpdates";
import { Event } from "@/types/localTypes";

/**
 * Combined activity type for group activities
 * Includes both traditional activities and group updates
 */
interface GroupActivity extends Omit<Activity, 'content_type'> {
  content_type: 'events' | 'group_updates';
  group_update?: GroupUpdate;
  event?: Event;
}

/**
 * Fetch activities specific to a group
 * This includes events created for the group and group updates/posts
 */
const fetchGroupActivities = async (groupId: string): Promise<GroupActivity[]> => {
  const activities: GroupActivity[] = [];

  try {
    // Fetch group events (events where group_id matches)
    const { data: groupEvents, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        time,
        location,
        host_id,
        group_id,
        created_at,
        neighborhood_id,
        profiles:host_id (
          display_name,
          avatar_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('Error fetching group events:', eventsError);
    } else if (groupEvents) {
      // Convert events to group activities
      const eventActivities: GroupActivity[] = groupEvents.map(event => ({
        id: `event-${event.id}`,
        actor_id: event.host_id,
        activity_type: 'event_created' as any,
        content_id: event.id,
        content_type: 'events',
        title: `${event.profiles?.display_name || 'A member'} created event: ${event.title}`,
        created_at: event.created_at,
        neighborhood_id: event.neighborhood_id,
        metadata: {
          eventTitle: event.title,
          eventTime: event.time,
          eventLocation: event.location
        },
        is_public: true,
        profiles: event.profiles || { display_name: null, avatar_url: null },
        event: event as Event
      }));
      activities.push(...eventActivities);
    }

    // Fetch group updates (posts/announcements in the group)
    const { data: groupUpdates, error: updatesError } = await supabase
      .from('group_updates')
      .select(`
        id,
        group_id,
        user_id,
        content,
        image_urls,
        created_at,
        updated_at,
        is_deleted
      `)
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (updatesError) {
      console.error('Error fetching group updates:', updatesError);
    } else if (groupUpdates) {
      // Fetch profiles separately to avoid relation issues
      const userIds = [...new Set(groupUpdates.map(update => update.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      // Convert group updates to group activities
      const updateActivities: GroupActivity[] = groupUpdates.map(update => {
        const userProfile = profiles?.find(p => p.id === update.user_id);
        return {
          id: `update-${update.id}`,
          actor_id: update.user_id,
          activity_type: 'group_update_created' as any,
          content_id: update.id,
          content_type: 'group_updates',
          title: `${userProfile?.display_name || 'A member'} posted an update`,
          created_at: update.created_at,
          neighborhood_id: '', // Group updates don't have neighborhood_id directly
          metadata: {
            updateContent: update.content.slice(0, 100), // Preview of content
            hasImages: (update.image_urls || []).length > 0
          },
          is_public: true,
          profiles: {
            display_name: userProfile?.display_name || '',
            avatar_url: userProfile?.avatar_url || ''
          },
          group_update: update as GroupUpdate
        };
      });
      activities.push(...updateActivities);
    }

    // Sort all activities by creation date (newest first)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return activities;
  } catch (error) {
    console.error('Error fetching group activities:', error);
    return [];
  }
};

/**
 * Hook for fetching group-specific activities
 * Returns events and updates that belong to this group only
 */
export const useGroupActivities = (groupId: string) => {
  const query = useQuery({
    queryKey: ["group-activities", groupId],
    queryFn: () => fetchGroupActivities(groupId),
    enabled: !!groupId,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  });
  
  // Set up real-time subscription for group activities
  useEffect(() => {
    if (!groupId) return;
    
    // Subscribe to events for this group
    const eventsChannel = supabase
      .channel(`group-events-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    // Subscribe to group updates for this group
    const updatesChannel = supabase
      .channel(`group-updates-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_updates',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [groupId, query]);
  
  return query;
};