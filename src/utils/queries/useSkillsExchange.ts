
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Custom hook for fetching skills exchange data with neighborhood filtering
 * Now properly filters by current neighborhood and includes neighborhood_id in query key
 */
export const useSkillsExchange = () => {
  // Get the current neighborhood context
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    // Include neighborhood_id in query key for proper cache isolation
    queryKey: ['skills-exchange', neighborhood?.id],
    queryFn: async () => {
      // Log the query attempt with timestamp and neighborhood info
      console.log('[useSkillsExchange] Fetching skills exchange data', {
        timestamp: new Date().toISOString(),
        neighborhoodId: neighborhood?.id,
        neighborhoodName: neighborhood?.name
      });

      // If no neighborhood is selected, return empty array
      if (!neighborhood?.id) {
        console.log('[useSkillsExchange] No neighborhood selected, returning empty array');
        return [];
      }

      try {
        // Query skills_exchange table filtered by current neighborhood
        const { data, error } = await supabase
          .from('skills_exchange')
          .select(`
            *,
            profiles (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('neighborhood_id', neighborhood.id) // Filter by current neighborhood
          .order('created_at', { ascending: false });

        if (error) {
          // Enhanced error logging with neighborhood context
          console.error('[useSkillsExchange] Error fetching skills exchange:', {
            error: {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            },
            neighborhoodId: neighborhood.id,
            timestamp: new Date().toISOString()
          });
          throw error;
        }

        // Log the returned data count with neighborhood info
        console.log('[useSkillsExchange] Skills exchange data fetched successfully:', {
          count: data?.length || 0,
          neighborhoodId: neighborhood.id,
          neighborhoodName: neighborhood.name,
          timestamp: new Date().toISOString()
        });
        
        return data;
      } catch (error) {
        // Catch and log any unexpected errors
        console.error('[useSkillsExchange] Unexpected error in skills fetch:', {
          error,
          neighborhoodId: neighborhood?.id
        });
        throw error;
      }
    },
    // Only run the query if we have a neighborhood
    enabled: !!neighborhood?.id,
    // Add retry configuration for intermittent network issues
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
