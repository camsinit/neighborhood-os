
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { runWithAuthCheck } from "@/utils/authStateCheck";

/**
 * Hook to fetch safety updates for the current neighborhood
 * With enhanced error handling for TypeScript correctness and debugging RLS issues
 */
export const useSafetyUpdates = () => {
  // Get the current user for auth context debugging
  const user = useUser();
  
  // Get the current neighborhood - this will return null if none is selected
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    queryKey: ['safety-updates', neighborhood?.id],
    queryFn: async () => {
      console.log("[useSafetyUpdates] Starting query with neighborhood:", {
        neighborhoodId: neighborhood?.id, 
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
            .eq('neighborhood_id', neighborhood?.id) // Use neighborhood?.id instead of neighborhood
            .order('created_at', { ascending: false });
        }, 'safety_updates_query');
      } catch (err) {
        console.error("[useSafetyUpdates] Unexpected error:", err);
        // Return an empty data structure to prevent errors
        return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    enabled: !!neighborhood?.id && !!user, // Only run query if we have BOTH a neighborhood ID AND authenticated user
  });
};
