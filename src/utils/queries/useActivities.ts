import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ActivityType = 
  | 'event_created' 
  | 'event_rsvp' 
  | 'skill_offered' 
  | 'skill_requested' 
  | 'good_shared' 
  | 'good_requested' 
  | 'care_offered' 
  | 'care_requested' 
  | 'safety_update';

export interface Activity {
  id: string;
  actor_id: string;
  activity_type: ActivityType;
  content_id: string;
  content_type: string;
  title: string;
  created_at: string;
  metadata?: any;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

/**
 * Fetches recent activities from the database
 * 
 * This has been modified to fetch up-to-date titles from related content tables
 * instead of relying solely on the stored title in the activities table
 */
const fetchActivities = async (): Promise<Activity[]> => {
  // Fetch activities with profile information
  const { data: activitiesData, error } = await supabase
    .from('activities')
    .select(`
      id,
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      created_at,
      metadata,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  // Create a map to store updates for activity titles
  const updatedTitlesMap = new Map<string, string>();

  // Get all unique event IDs from activities
  const eventIds = activitiesData
    .filter(activity => activity.content_type === 'events')
    .map(activity => activity.content_id);

  if (eventIds.length > 0) {
    // Fetch the latest event titles
    const { data: eventTitles } = await supabase
      .from('events')
      .select('id, title')
      .in('id', eventIds);

    // Map event IDs to their current titles
    eventTitles?.forEach(event => {
      updatedTitlesMap.set(event.id, event.title);
    });
  }

  // Process activities and use updated titles where available
  const activities = activitiesData.map(activity => {
    // If this is an event activity and we have an updated title, use it
    if (activity.content_type === 'events' && updatedTitlesMap.has(activity.content_id)) {
      return {
        ...activity,
        title: updatedTitlesMap.get(activity.content_id)!
      };
    }
    
    // Otherwise use the title as stored in the activities table
    return activity;
  });

  return activities;
};

/**
 * Custom hook for fetching recent neighborhood activities
 */
export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
};
