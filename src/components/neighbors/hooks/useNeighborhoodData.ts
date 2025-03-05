
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
        
        // First check if user created any neighborhoods
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

        // Call our RPC function that safely checks membership
        // NOTE: We need to use explicit typing because TypeScript doesn't know about our custom RPC functions
        const { data: membershipData, error: membershipError } = await supabase
          .rpc('get_user_neighborhoods', {
            user_uuid: user.id
          }) as {
            data: Neighborhood[] | null;
            error: Error | null;
          };
        
        if (membershipError) {
          throw membershipError;
        }
        
        if (membershipData) {
          setNeighborhoods(membershipData);
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
