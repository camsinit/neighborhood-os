
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useUser } from "@supabase/auth-helpers-react";

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
        // First, verify auth context is working
        // Using a direct query instead of RPC to avoid TypeScript errors
        const { data: authContext, error: authError } = await supabase
          .from('auth_users_view')  // This view should be accessible to get basic auth info
          .select('id')
          .limit(1);
        
        if (authError) {
          console.error("[useSafetyUpdates] Auth context check failed:", authError);
        } else {
          console.log("[useSafetyUpdates] Auth context check result:", {
            hasData: !!authContext,
            authId: authContext?.[0]?.id,
            userMatchesAuth: authContext?.[0]?.id === user?.id
          });
        }
        
        // Now try to fetch the safety updates
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
            userId: user?.id,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
        
        console.log("[useSafetyUpdates] Query successful:", {
          count: data?.length || 0,
          neighborhoodId,
          userId: user?.id,
          firstItem: data?.[0]?.id,
          timestamp: new Date().toISOString()
        });
        
        return data || [];
      } catch (err) {
        console.error("[useSafetyUpdates] Unexpected error:", err);
        throw err;
      }
    },
    enabled: !!neighborhoodId && !!user, // Only run query if we have BOTH a neighborhood ID AND authenticated user
  });
};
