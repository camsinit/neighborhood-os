
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

// Define types for the neighborhood data
interface Neighborhood {
  id: string;
  name: string;
  joined_at?: string;
}

/**
 * Custom hook to fetch and manage a user's neighborhoods
 * 
 * UPDATED: Now works with the new get_user_accessible_neighborhoods function signature
 */
export function useNeighborhoodData() {
  const user = useUser();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually trigger a refresh
  const refreshNeighborhoods = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch neighborhoods data
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useNeighborhoodData] Fetching neighborhoods for user:", user.id);
        
        // UPDATED: Use the new security definer function with updated return type
        const { data: accessibleNeighborhoods, error: accessError } = await supabase
          .rpc('get_user_accessible_neighborhoods', { user_uuid: user.id });

        if (accessError) {
          console.warn("[useNeighborhoodData] Error getting accessible neighborhoods:", accessError);
          throw accessError;
        }

        if (accessibleNeighborhoods && accessibleNeighborhoods.length > 0) {
          // Extract neighborhood IDs from the new return format {neighborhood_id, access_type}
          const neighborhoodIds = accessibleNeighborhoods.map(n => n.neighborhood_id);
          
          // Get details for all accessible neighborhoods using the new RLS policy
          const { data: neighborhoodDetails, error: detailsError } = await supabase
            .from('neighborhoods')
            .select('id, name, created_at')
            .in('id', neighborhoodIds);

          if (detailsError) {
            console.warn("[useNeighborhoodData] Error getting neighborhood details:", detailsError);
            throw detailsError;
          }

          // Transform the data to match our interface
          const allNeighborhoods: Neighborhood[] = neighborhoodDetails?.map(n => ({
            id: n.id,
            name: n.name,
            joined_at: n.created_at
          })) || [];
          
          setNeighborhoods(allNeighborhoods);
        } else {
          setNeighborhoods([]);
        }
        
      } catch (err: any) {
        console.error("[useNeighborhoodData] Error fetching neighborhoods:", err);
        setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
        toast.error("Failed to load your neighborhoods");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNeighborhoods();
  }, [user, refreshTrigger]);

  return { 
    neighborhoods, 
    isLoading, 
    error, 
    refreshNeighborhoods 
  };
}
