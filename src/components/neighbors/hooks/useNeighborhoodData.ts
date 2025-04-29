
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
 * Uses security definer functions to avoid RLS recursion issues
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
        
        // Try to use our safe RPC function first
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_user_neighborhoods_simple', { user_uuid: user.id });
            
          if (!rpcError && rpcData && rpcData.length > 0) {
            setNeighborhoods(rpcData);
            setIsLoading(false);
            return;
          }
        } catch (rpcErr) {
          console.warn("[useNeighborhoodData] RPC error, falling back:", rpcErr);
        }
        
        // Fall back to checking created neighborhoods
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('id, name')
          .eq('created_by', user.id);

        if (createdError) {
          console.warn("[useNeighborhoodData] Error checking created neighborhoods:", createdError);
        }
        
        // If user created neighborhoods, use those
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          const formattedNeighborhoods = createdNeighborhoods.map(item => ({
            id: item.id,
            name: item.name,
            joined_at: new Date().toISOString() // Default value
          }));
          
          setNeighborhoods(formattedNeighborhoods);
          setIsLoading(false);
          return;
        }

        // Next try direct membership query
        const { data: memberships, error: membershipError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', user.id)
          .eq('status', 'active');
          
        if (membershipError) {
          console.warn("[useNeighborhoodData] Error checking memberships:", membershipError);
        } else if (memberships && memberships.length > 0) {
          // We have memberships, now get full neighborhood details
          const neighborhoodIds = memberships.map(m => m.neighborhood_id);
          
          const { data: neighborhoodData, error: neighborhoodError } = await supabase
            .from('neighborhoods')
            .select('id, name')
            .in('id', neighborhoodIds);
            
          if (neighborhoodError) {
            console.warn("[useNeighborhoodData] Error getting neighborhoods:", neighborhoodError);
          } else if (neighborhoodData) {
            // Format with joined_at date
            const formattedNeighborhoods = neighborhoodData.map(n => ({
              id: n.id,
              name: n.name,
              joined_at: new Date().toISOString() // Default value since we don't have joined_at
            }));
            
            setNeighborhoods(formattedNeighborhoods);
            setIsLoading(false);
            return;
          }
        }
        
        // If we get here, we found no neighborhoods
        setNeighborhoods([]);
        
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
