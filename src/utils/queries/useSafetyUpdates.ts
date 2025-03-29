
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { runWithAuthCheck } from "@/utils/authStateCheck";

/**
 * Hook to fetch safety updates for the current neighborhood
 * With enhanced error logging for debugging RLS issues
 */
export const useSafetyUpdates = () => {
  // Get the current user for auth context debugging
  const user = useUser();
  
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
      console.log("[useSafetyUpdates] Starting query with neighborhood:", {
        neighborhoodId, 
        userId: user?.id,
        isAuthenticated: !!user,
        timestamp: new Date().toISOString()
      });
      
      try {
        // Use our enhanced auth checking utility to run the query
        return await runWithAuthCheck(async () => {
          // Now try to fetch the safety updates
          return await supabase
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
        }, 'safety_updates_query');
      } catch (err) {
        console.error("[useSafetyUpdates] Unexpected error:", err);
        throw err;
      }
    },
    enabled: !!neighborhoodId && !!user, // Only run query if we have BOTH a neighborhood ID AND authenticated user
  });
};
