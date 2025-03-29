
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Hook to fetch safety updates for the current neighborhood
 * With enhanced error logging for debugging RLS issues
 */
export const useSafetyUpdates = () => {
  // Get the current neighborhood ID - this will throw if none is selected
  let neighborhoodId;
  
  try {
    neighborhoodId = useCurrentNeighborhood();
  } catch (error) {
    console.error("[useSafetyUpdates] Failed to get neighborhood context:", error);
    // We'll let the query run but it will likely fail due to RLS
  }

  return useQuery({
    queryKey: ['safety-updates', neighborhoodId],
    queryFn: async () => {
      console.log("[useSafetyUpdates] Starting query with neighborhood:", neighborhoodId);
      
      try {
        const { data, error } = await supabase
          .from('safety_updates')
          .select(`
            *,
            profiles (
              display_name,
              avatar_url
            )
          `)
          .eq('neighborhood_id', neighborhoodId) // Explicitly filter by neighborhood
          .order('created_at', { ascending: false });

        if (error) {
          console.error("[useSafetyUpdates] Query error:", {
            error: {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            },
            neighborhoodId,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
        
        console.log("[useSafetyUpdates] Query successful:", {
          count: data?.length || 0,
          neighborhoodId,
          firstItem: data?.[0]?.id,
          timestamp: new Date().toISOString()
        });
        
        return data || [];
      } catch (err) {
        console.error("[useSafetyUpdates] Unexpected error:", err);
        throw err;
      }
    },
    enabled: !!neighborhoodId, // Only run query if we have a neighborhood ID
  });
};
