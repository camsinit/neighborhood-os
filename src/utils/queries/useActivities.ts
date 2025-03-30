
/**
 * This module provides functionality to fetch and manage neighborhood activities
 * It has been enhanced to ensure activity titles stay synchronized with their source content
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define activity types for better type safety
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

// Main Activity interface
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
 * Fetches content titles from their respective tables
 * Used to ensure activity feeds show up-to-date titles
 * 
 * @param contentIds Map of content types to arrays of IDs
 * @returns Map of content IDs to their current titles
 */
const fetchContentTitles = async (
  contentIds: Record<string, string[]>
): Promise<Map<string, string>> => {
  const titleMap = new Map<string, string>();
  
  // Helper function to fetch titles for a specific content type
  const fetchTitlesForType = async (
    tableName: string, 
    ids: string[]
  ): Promise<void> => {
    if (ids.length === 0) return;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id, title')
      .in('id', ids);
      
    if (error) {
      console.error(`Error fetching ${tableName} titles:`, error);
      return;
    }
    
    // Add titles to our map
    data?.forEach(item => {
      titleMap.set(item.id, item.title);
    });
  };
  
  // Process each content type in parallel for better performance
  const fetchPromises: Promise<void>[] = [];
  
  if (contentIds.events?.length) {
    fetchPromises.push(fetchTitlesForType('events', contentIds.events));
  }
  
  if (contentIds.safety_updates?.length) {
    fetchPromises.push(fetchTitlesForType('safety_updates', contentIds.safety_updates));
  }
  
  if (contentIds.skills_exchange?.length) {
    fetchPromises.push(fetchTitlesForType('skills_exchange', contentIds.skills_exchange));
  }
  
  if (contentIds.goods_exchange?.length) {
    fetchPromises.push(fetchTitlesForType('goods_exchange', contentIds.goods_exchange));
  }
  
  if (contentIds.care_requests?.length) {
    fetchPromises.push(fetchTitlesForType('care_requests', contentIds.care_requests));
  }
  
  // Wait for all fetch operations to complete
  await Promise.all(fetchPromises);
  
  return titleMap;
};

/**
 * Fetches recent activities from the database
 * 
 * This has been optimized to fetch up-to-date titles from related content tables
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

  // Group content IDs by their content type for efficient batch fetching
  const contentIdsByType: Record<string, string[]> = {};
  
  activitiesData.forEach(activity => {
    const contentType = activity.content_type;
    if (!contentIdsByType[contentType]) {
      contentIdsByType[contentType] = [];
    }
    contentIdsByType[contentType].push(activity.content_id);
  });
  
  // Fetch current titles for all content
  const updatedTitlesMap = await fetchContentTitles(contentIdsByType);
  
  // Process activities and use updated titles where available
  const activities = activitiesData.map(activity => {
    // If we have an updated title for this content, use it
    if (updatedTitlesMap.has(activity.content_id)) {
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
 * Returns activities with synchronized titles from their source content
 */
export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
};
