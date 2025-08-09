
import { supabase } from "@/integrations/supabase/client";
import { runWithAuthCheck } from "@/utils/authStateCheck";
import { useNeighborhoodQuery } from "@/hooks/useNeighborhoodQuery";
import { createLogger } from "@/utils/logger";

// Logger to keep output consistent and suppress noise unless debug is enabled
const logger = createLogger('useSafetyUpdates');

/**
 * Hook to fetch safety updates for the current neighborhood
 * With enhanced error handling for TypeScript correctness and debugging RLS issues
 */
export const useSafetyUpdates = () => {
  // Use neighborhood-aware query wrapper to unify keys and enabled gating
  return useNeighborhoodQuery<any>(
    ['safety-updates'],
    async (neighborhoodId: string) => {
      logger.info("Starting safety updates query", {
        neighborhoodId,
        timestamp: new Date().toISOString()
      });
      
      try {
        // Use our enhanced auth checking utility to run the query
        return await runWithAuthCheck(async () => {
          // Fetch the safety updates scoped to the neighborhood
          return await supabase
            .from('safety_updates')
            .select(`
              *,
              profiles (
                display_name,
                avatar_url
              )
            `)
            .eq('neighborhood_id', neighborhoodId)
            .order('created_at', { ascending: false });
        }, 'safety_updates_query');
      } catch (err) {
        logger.error("Unexpected error during safety updates query", err as any);
        // Return a consistent empty structure to prevent UI errors
        return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
      }
    }
  );
};
