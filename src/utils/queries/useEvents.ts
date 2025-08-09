
import { Event } from "@/types/localTypes"; // Updated import
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhoodQuery } from "@/hooks/useNeighborhoodQuery";
import { createLogger } from "@/utils/logger";

// Centralized logger for this hook to avoid noisy console logs
const logger = createLogger('useEvents');

/**
 * Fetches events from the database with host profile information
 * Now properly filtered by current neighborhood
 * 
 * @returns Promise containing array of events for the current neighborhood
 */
const fetchEvents = async (neighborhoodId: string): Promise<Event[]> => {
  // Log the fetch request for debugging with neighborhood context
  logger.info("Fetching events from database", {
    neighborhoodId,
    timestamp: new Date().toISOString()
  });
  
  // Fetch events filtered by neighborhood and join with profiles to get host information
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:host_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('neighborhood_id', neighborhoodId) // Filter by current neighborhood
    .order('time', { ascending: true });

  if (error) {
    logger.error('Error fetching events', { error, neighborhoodId, timestamp: new Date().toISOString() });
    throw error;
  }

  logger.info(`Retrieved ${data?.length || 0} events`, { neighborhoodId });

  // Transform the data to match our Event type
  return (data || []).map(event => ({
    ...event,
    // Ensure we have profile info, using fallbacks if missing
    profiles: event.profiles || {
      id: event.host_id,
      display_name: 'Anonymous',
      avatar_url: '/placeholder.svg'
    }
  }));
};

/**
 * React Query hook for fetching events with neighborhood filtering
 * Now includes neighborhood_id in query key for proper cache isolation
 */
export const useEvents = () => {
  // Use our neighborhood-aware query wrapper to ensure correct cache keys and gating
  return useNeighborhoodQuery<Event[]>(
    ["events"],
    (neighborhoodId: string) => fetchEvents(neighborhoodId)
  );
};
