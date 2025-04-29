/**
 * This file contains the core service function to fetch activities
 */
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "./types";
import { fetchContentTitles } from "./contentUtils";
import { isContentDeleted, normalizeMetadata } from "./metadataUtils";

/**
 * Fetches recent activities from the database
 * 
 * This has been updated to use a security definer function to avoid RLS recursion
 */
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    // Use our security definer function to get activities safely
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("[fetchActivities] No authenticated user found");
      return [];
    }
    
    // Call our safe RPC function with user ID
    const { data: activitiesData, error } = await supabase
      .rpc('get_activities_safe', { 
        user_uuid: user.id,
        limit_count: 20
      });

    if (error) {
      console.error('[fetchActivities] Error fetching activities:', error);
      throw error;
    }

    // Group content IDs by their content type for efficient batch fetching
    // Skip any items that are already marked as deleted in metadata
    const contentIdsByType: Record<string, string[]> = {};
    
    activitiesData.forEach((activity: any) => {
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
    const activities = activitiesData.map((activity: any) => {
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
  } catch (error) {
    console.error('[fetchActivities] Unexpected error:', error);
    return [];
  }
};
