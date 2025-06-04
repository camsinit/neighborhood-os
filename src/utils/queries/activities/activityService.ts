
/**
 * This file contains the core service function to fetch activities
 * Now properly filtered by neighborhood
 */
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "./types";
import { fetchContentTitles } from "./contentUtils";
import { isContentDeleted, normalizeMetadata } from "./metadataUtils";
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this service
const logger = createLogger('activityService');

/**
 * Fetches recent activities from the database
 * Now properly filtered by current neighborhood
 * 
 * This has been optimized to fetch up-to-date titles from related content tables
 * and properly handle deleted content references
 */
export const fetchActivities = async (neighborhoodId: string | null): Promise<Activity[]> => {
  logger.debug('Fetching activities', {
    neighborhoodId,
    timestamp: new Date().toISOString()
  });
  
  // If no neighborhood is selected, return empty array
  if (!neighborhoodId) {
    logger.debug('No neighborhood selected, returning empty array');
    return [];
  }
  
  // Fetch activities with profile information filtered by neighborhood
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
      neighborhood_id,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('neighborhood_id', neighborhoodId) // Filter by current neighborhood
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    logger.error('Error fetching activities:', {
      error,
      neighborhoodId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  logger.debug(`Fetched ${activitiesData.length} activities for neighborhood ${neighborhoodId}`);

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
  
  logger.debug(`Fetched ${updatedTitlesMap.size} current content titles`);
  
  // Process activities and use updated titles where available
  const activities = activitiesData.map(activity => {
    // Ensure metadata is an object we can work with
    const metadata = normalizeMetadata(activity.metadata);
    
    // If we have an updated title for this content, use it
    if (updatedTitlesMap.has(activity.content_id)) {
      return {
        ...activity,
        metadata: metadata, // Ensure we have the correct metadata type
        title: updatedTitlesMap.get(activity.content_id)!
      } as Activity;
    } else if (!isContentDeleted(metadata) && !updatedTitlesMap.has(activity.content_id)) {
      // If we didn't get a title AND the content wasn't explicitly marked as deleted,
      // it probably means the content was deleted without proper cleanup
      logger.info(`Content not found for activity ${activity.id}, marking as implicitly deleted`);
      
      // Mark it as implicitly deleted
      return {
        ...activity,
        metadata: {
          ...metadata,
          deleted: true,
          original_title: activity.title
        }
      } as Activity;
    }
    
    // Otherwise use the title as stored in the activities table
    return {
      ...activity,
      metadata: metadata
    } as Activity;
  });

  return activities as Activity[];
};
