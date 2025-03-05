
/**
 * Updated useSafetyUpdates hook that respects neighborhood context
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/hooks/useNeighborhood";

/**
 * Hook to fetch safety updates for the current neighborhood
 */
export const useSafetyUpdates = () => {
  // Get the current neighborhood
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  return useQuery({
    queryKey: ['safety-updates', neighborhood?.id],
    queryFn: async () => {
      // If no neighborhood selected, return empty array
      if (!neighborhood?.id) {
        console.log("[useSafetyUpdates] No neighborhood selected, returning empty array");
        return [];
      }
      
      // Fetch safety updates for the current neighborhood
      const { data, error } = await supabase
        .from('safety_updates')
        .select(`
          *,
          profiles:author_id (
            display_name,
            avatar_url
          )
        `)
        .eq('neighborhood_id', neighborhood.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useSafetyUpdates] Error fetching safety updates:', error);
        throw error;
      }

      return data || [];
    },
    // Only enable the query when we have a neighborhood
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
  });
};
