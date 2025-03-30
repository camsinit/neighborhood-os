
/**
 * This module provides functionality to fetch and manage neighborhood activities
 * It has been enhanced to ensure activity titles stay synchronized with their source content
 * and properly handle deleted content
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

// Define the shape of metadata to ensure type safety
interface ActivityMetadata {
  deleted?: boolean;
  original_title?: string;
  [key: string]: any;
}

// Main Activity interface
export interface Activity {
  id: string;
  actor_id: string;
  activity_type: ActivityType;
  content_id: string;
  content_type: string;
  title: string;
  created_at: string;
  metadata?: ActivityMetadata;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

// Define valid content tables for type safety
type ContentTable = 'events' | 'safety_updates' | 'skills_exchange' | 'goods_exchange' | 'care_requests';

/**
 * Helper function to fetch titles for a specific content type with type safety
 * 
 * @param tableName Name of the table to query
 * @param ids Array of content IDs to look up
 * @param titleMap Map to store the results
 */
const fetchTitlesForType = async (
  tableName: ContentTable, 
  ids: string[],
  titleMap: Map<string, string>
): Promise<void> => {
  // Skip if no IDs to fetch
  if (ids.length === 0) return;
  
  // All these tables have the same structure for id and title columns
  // so we can use a generic query with type safety
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
    if (item.id && item.title) {
      titleMap.set(item.id, item.title);
    }
  });
};

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
  
  // Process each content type in parallel for better performance
  const fetchPromises: Promise<void>[] = [];
  
  // Type-safe mapping of content types to their tables
  const validTables: ContentTable[] = ['events', 'safety_updates', 'skills_exchange', 'goods_exchange', 'care_requests'];
  
  // Create a promise for each table that has IDs to fetch
  validTables.forEach(table => {
    if (contentIds[table]?.length) {
      fetchPromises.push(fetchTitlesForType(table, contentIds[table], titleMap));
    }
  });
  
  // Wait for all fetch operations to complete
  await Promise.all(fetchPromises);
  
  return titleMap;
};

/**
 * Helper function to safely check if metadata has the deleted flag
 * This handles cases where metadata might be a string or other non-object type
 */
const isContentDeleted = (metadata: any): boolean => {
  // Check if metadata exists and is an object
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Now we can safely check for the deleted property
  return metadata.deleted === true;
};

/**
 * Fetches recent activities from the database
 * 
 * This has been optimized to fetch up-to-date titles from related content tables
 * and properly handle deleted content references
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
  // Skip any items that are already marked as deleted in metadata
  const contentIdsByType: Record<string, string[]> = {};
  
  activitiesData.forEach(activity => {
    // Skip if activity is already marked as deleted
    if (isContentDeleted(activity.metadata)) return;
    
    const contentType = activity.content_type;
    if (!contentIdsByType[contentType]) {
      contentIdsByType[contentType] = [];
    }
    contentIdsByType[contentType].push(activity.content_id);
  });
  
  // Fetch current titles for all content that hasn't been deleted
  const updatedTitlesMap = await fetchContentTitles(contentIdsByType);
  
  // Process activities and use updated titles where available
  const activities = activitiesData.map(activity => {
    // Ensure metadata is an object we can work with
    const metadata = typeof activity.metadata === 'object' && activity.metadata !== null 
      ? activity.metadata 
      : {};
    
    // If we have an updated title for this content, use it
    if (updatedTitlesMap.has(activity.content_id)) {
      return {
        ...activity,
        title: updatedTitlesMap.get(activity.content_id)!
      };
    } else if (!isContentDeleted(metadata) && !updatedTitlesMap.has(activity.content_id)) {
      // If we didn't get a title AND the content wasn't explicitly marked as deleted,
      // it probably means the content was deleted without proper cleanup
      // Mark it as implicitly deleted
      return {
        ...activity,
        metadata: {
          ...metadata,
          deleted: true,
          original_title: activity.title
        }
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
 * and proper handling for deleted content
 */
export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
};
