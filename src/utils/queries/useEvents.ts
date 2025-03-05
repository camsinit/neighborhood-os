
/**
 * Updated useEvents hook that respects neighborhood context
 */
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/localTypes";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/hooks/useNeighborhood";

/**
 * Hook to fetch events for the current neighborhood
 */
export const useEvents = () => {
  // Get the current neighborhood
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  return useQuery({
    queryKey: ["events", neighborhood?.id],
    queryFn: async () => {
      // If no neighborhood selected, return empty array
      if (!neighborhood?.id) {
        console.log("[useEvents] No neighborhood selected, returning empty array");
        return [];
      }
      
      // Fetch events for the current neighborhood
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
        .eq('neighborhood_id', neighborhood.id)
        .order('time', { ascending: true });

      if (error) {
        console.error('[useEvents] Error fetching events:', error);
        throw error;
      }

      // Transform the data to match our Event type
      return (data || []).map(event => ({
        ...event,
        profiles: event.profiles || {
          id: event.host_id,
          display_name: 'Anonymous',
          avatar_url: '/placeholder.svg'
        }
      })) as Event[];
    },
    // Only enable the query when we have a neighborhood
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
  });
};
