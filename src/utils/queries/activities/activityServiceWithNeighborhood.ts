
/**
 * Enhanced activity service that properly handles neighborhood context
 * 
 * This version takes neighborhood ID as a parameter to avoid hook usage issues
 */
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "./types";
import { syncActivityTitles } from "./titleSyncService";

/**
 * Fetches activities for a specific neighborhood
 * 
 * @param neighborhoodId - The ID of the neighborhood to fetch activities for
 * @returns Promise<Activity[]> - Array of activities for the neighborhood
 */
export const fetchActivitiesForNeighborhood = async (neighborhoodId: string): Promise<Activity[]> => {
  console.log("[fetchActivitiesForNeighborhood] Starting to fetch activities for neighborhood:", neighborhoodId);

  try {
    // Fetch activities from the database for the specific neighborhood
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles!activities_actor_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('neighborhood_id', neighborhoodId) // Filter by specific neighborhood
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("[fetchActivitiesForNeighborhood] Database error:", error);
      throw error;
    }

    if (!activities || activities.length === 0) {
      console.log("[fetchActivitiesForNeighborhood] No activities found for neighborhood");
      return [];
    }

    console.log("[fetchActivitiesForNeighborhood] Raw activities fetched:", activities.length);

    // Sync titles with actual content
    const activitiesWithSyncedTitles = await syncActivityTitles(activities);
    
    console.log("[fetchActivitiesForNeighborhood] Activities after title sync:", activitiesWithSyncedTitles.length);
    return activitiesWithSyncedTitles;
    
  } catch (error) {
    console.error("[fetchActivitiesForNeighborhood] Error fetching activities:", error);
    throw error;
  }
};
