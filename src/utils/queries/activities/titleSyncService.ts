
/**
 * Service for synchronizing activity titles with their source content
 * 
 * This ensures activity feeds show up-to-date titles even if the original content was edited
 */
import { fetchContentTitles } from "./contentUtils";
import { Activity } from "./types";

/**
 * Syncs activity titles with their current content titles
 * Groups activities by content type for efficient batch fetching
 * 
 * @param activities Array of activities to sync titles for
 * @returns Array of activities with updated titles
 */
export const syncActivityTitles = async (activities: Activity[]): Promise<Activity[]> => {
  console.log("[syncActivityTitles] Starting title sync for", activities.length, "activities");
  
  // Group content IDs by their content type for batch fetching
  const contentIdsByType: Record<string, string[]> = {};
  
  activities.forEach(activity => {
    if (!contentIdsByType[activity.content_type]) {
      contentIdsByType[activity.content_type] = [];
    }
    contentIdsByType[activity.content_type].push(activity.content_id);
  });
  
  console.log("[syncActivityTitles] Content groups:", contentIdsByType);
  
  // Fetch all titles in batch
  const titleMap = await fetchContentTitles(contentIdsByType);
  
  console.log("[syncActivityTitles] Retrieved", titleMap.size, "titles");
  
  // Update activities with current titles
  const updatedActivities = activities.map(activity => {
    const currentTitle = titleMap.get(activity.content_id);
    
    // If we found a current title and it's different, update it
    if (currentTitle && currentTitle !== activity.title) {
      console.log(`[syncActivityTitles] Updating title for ${activity.id}: "${activity.title}" -> "${currentTitle}"`);
      return {
        ...activity,
        title: currentTitle
      };
    }
    
    return activity;
  });
  
  return updatedActivities;
};
