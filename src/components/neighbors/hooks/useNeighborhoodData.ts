
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
 * SIMPLIFIED: With clean RLS, we can query directly without security definer functions
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
        
        // SIMPLIFIED: With clean RLS, just query the neighborhoods directly
        // Check neighborhoods created by user
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at')
          .eq('created_by', user.id);

        if (createdError) {
          console.warn("[useNeighborhoodData] Error checking created neighborhoods:", createdError);
        }
        
        // Check neighborhoods where user is a member
        const { data: membershipData, error: membershipError } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhood_id,
            joined_at,
            neighborhoods:neighborhood_id(id, name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');
          
        if (membershipError) {
          console.warn("[useNeighborhoodData] Error checking memberships:", membershipError);
        }
        
        // Combine results
        const allNeighborhoods: Neighborhood[] = [];
        
        // Add created neighborhoods
        if (createdNeighborhoods) {
          createdNeighborhoods.forEach(n => {
            allNeighborhoods.push({
              id: n.id,
              name: n.name,
              joined_at: n.created_at
            });
          });
        }
        
        // Add member neighborhoods (avoid duplicates)
        if (membershipData) {
          membershipData.forEach((m: any) => {
            const neighborhood = m.neighborhoods;
            if (neighborhood && !allNeighborhoods.find(n => n.id === neighborhood.id)) {
              allNeighborhoods.push({
                id: neighborhood.id,
                name: neighborhood.name,
                joined_at: m.joined_at
              });
            }
          });
        }
        
        setNeighborhoods(allNeighborhoods);
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
