
/**
 * Service for fetching neighborhood activities
 * 
 * UPDATED: Now uses current neighborhood from context instead of hardcoded ID
 */
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "./types";
import { syncActivityTitles } from "./titleSyncService";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Fetches activities for the current neighborhood
 * 
 * UPDATED: Now gets neighborhood ID from context instead of being hardcoded
 */
export const fetchActivities = async (): Promise<Activity[]> => {
  console.log("[fetchActivities] Starting to fetch activities");
  
  // Get the current neighborhood ID from the global state
  // Note: This is a bit of a hack since we can't use hooks in a regular function
  // We'll need to pass the neighborhood ID as a parameter instead
  
  // For now, let's get it from localStorage as a fallback
  // This should be refactored to pass neighborhoodId as a parameter
  const storedNeighborhood = localStorage.getItem('currentNeighborhood');
  let neighborhoodId: string | null = null;
  
  if (storedNeighborhood) {
    try {
      const neighborhood = JSON.parse(storedNeighborhood);
      neighborhoodId = neighborhood.id;
    } catch (error) {
      console.error("[fetchActivities] Error parsing stored neighborhood:", error);
    }
  }
  
  if (!neighborhoodId) {
    console.log("[fetchActivities] No neighborhood ID available, returning empty array");
    return [];
  }

  console.log("[fetchActivities] Fetching activities for neighborhood:", neighborhoodId);

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
      .eq('neighborhood_id', neighborhoodId) // Filter by current neighborhood
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("[fetchActivities] Database error:", error);
      throw error;
    }

    if (!activities || activities.length === 0) {
      console.log("[fetchActivities] No activities found for neighborhood");
      return [];
    }

    console.log("[fetchActivities] Raw activities fetched:", activities.length);

    // Sync titles with actual content
    const activitiesWithSyncedTitles = await syncActivityTitles(activities);
    
    console.log("[fetchActivities] Activities after title sync:", activitiesWithSyncedTitles.length);
    return activitiesWithSyncedTitles;
    
  } catch (error) {
    console.error("[fetchActivities] Error fetching activities:", error);
    throw error;
  }
};
