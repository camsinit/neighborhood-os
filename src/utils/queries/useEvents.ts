
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/localTypes"; // Updated import
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Fetches events from the database with host profile information
 * Now properly filtered by current neighborhood
 * 
 * @returns Promise containing array of events for the current neighborhood
 */
const fetchEvents = async (neighborhoodId: string | null): Promise<Event[]> => {
  // Log the fetch request for debugging with neighborhood context
  console.log("[fetchEvents] Fetching events from database", {
    neighborhoodId,
    timestamp: new Date().toISOString()
  });
  
  // If no neighborhood is selected, return empty array
  if (!neighborhoodId) {
    console.log("[fetchEvents] No neighborhood selected, returning empty array");
    return [];
  }
  
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
    console.error('[fetchEvents] Error fetching events:', {
      error,
      neighborhoodId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  console.log(`[fetchEvents] Successfully retrieved ${data?.length || 0} events for neighborhood ${neighborhoodId}`);

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
  // Get the current neighborhood context
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    // Include neighborhood_id in query key for proper cache isolation
    queryKey: ["events", neighborhood?.id],
    queryFn: () => fetchEvents(neighborhood?.id || null),
    // Only run the query if we have a neighborhood
    enabled: !!neighborhood?.id,
  });
};
