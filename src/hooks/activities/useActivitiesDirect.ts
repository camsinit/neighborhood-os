
/**
 * useActivitiesDirect.ts
 * 
 * Simplified hook for fetching neighborhood activities using React Query
 * UPDATED: Now uses the new simplified helper function
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { refreshEvents, EventType } from "@/utils/refreshEvents";
import { useEffect } from "react";

// Create a dedicated logger for this hook
const logger = createLogger('useActivitiesDirect');

/**
 * Activity type definition that matches the database schema
 */
export interface Activity {
  id: string;
  actor_id: string;
  activity_type: string;
  content_id: string;
  content_type: string;
  title: string;
  created_at: string;
  neighborhood_id: string | null;
  metadata?: any;
  // Join data
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  }
}

/**
 * Simple function to fetch activities directly from the database
 */
const fetchActivities = async (limit: number = 20): Promise<Activity[]> => {
  logger.debug(`Fetching activities, limit=${limit}`);
  
  // Get the current user - we need their ID for neighborhood access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('No authenticated user found, returning empty activities array');
    return [];
  }
  
  // Use the new simplified helper function to get neighborhood IDs
  const { data: neighborhoodIds, error: neighborhoodError } = await supabase
    .rpc('get_user_neighborhood_ids', { user_uuid: user.id });
    
  if (neighborhoodError) {
    logger.error('Error fetching user neighborhoods:', neighborhoodError);
    throw neighborhoodError;
  }
  
  if (!neighborhoodIds || neighborhoodIds.length === 0) {
    logger.debug('User has no neighborhoods, returning empty activities array');
    return [];
  }
  
  // Query the activities table with a join to get actor profiles
  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .in('neighborhood_id', neighborhoodIds)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (activitiesError) {
    logger.error('Error fetching activities:', activitiesError);
    throw activitiesError;
  }
  
  logger.debug(`Retrieved ${activities?.length || 0} activities`);
  return activities || [];
};

/**
 * Custom hook for fetching activities
 * 
 * @param limit - Maximum number of activities to fetch
 * @returns Query result with activities data
 */
export const useActivitiesDirect = (limit: number = 20) => {
  // Use React Query with polling enabled
  const query = useQuery({
    queryKey: ["activities", limit],
    queryFn: () => fetchActivities(limit),
    // Set up automatic polling
    refetchInterval: 60000, // 1 minute
    refetchIntervalInBackground: false,
    // Enable automatic refetching when window regains focus
    refetchOnWindowFocus: true,
    // Add some retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Set up listeners for activity refresh events using the improved event system
  useEffect(() => {
    logger.debug("Setting up activity refresh listeners");
    
    // Define all events that should trigger an activities refresh
    const activityEventTypes: EventType[] = [
      'activities-updated',
      'event-submitted',
      'safety-updated',
      'goods-updated',
      'skills-updated'
    ];
    
    // Create a handler for refresh events
    const handleRefreshEvent = () => {
      logger.debug("Activity refresh event detected");
      query.refetch();
    };
    
    // Set up subscriptions for all relevant events
    const unsubscribers = activityEventTypes.map(eventType => 
      refreshEvents.on(eventType, handleRefreshEvent)
    );
    
    // Clean up subscriptions on unmount
    return () => {
      logger.debug("Cleaning up activity refresh listeners");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [query]);
  
  // Return the query result
  return query;
};
