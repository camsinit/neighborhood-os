
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
 * UPDATED: Now uses direct queries instead of removed security definer functions
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

  // Fetch neighborhoods data using direct queries
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
        
        // First, get neighborhoods the user created
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at')
          .eq('created_by', user.id);

        if (createdError) {
          console.warn("[useNeighborhoodData] Error getting created neighborhoods:", createdError);
          throw createdError;
        }

        // Then, get neighborhoods the user is a member of
        const { data: memberData, error: memberError } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhood_id,
            joined_at,
            neighborhoods:neighborhood_id (
              id,
              name,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (memberError) {
          console.warn("[useNeighborhoodData] Error getting user neighborhoods:", memberError);
          throw memberError;
        }

        // Combine created neighborhoods and member neighborhoods
        const allNeighborhoods: Neighborhood[] = [
          ...(createdNeighborhoods?.map(n => ({
            id: n.id,
            name: n.name,
            joined_at: n.created_at
          })) || []),
          ...(memberData?.map(member => ({
            id: member.neighborhoods.id,
            name: member.neighborhoods.name,
            joined_at: member.joined_at
          })).filter(Boolean) || [])
        ];

        // Remove duplicates based on id
        const uniqueNeighborhoods = allNeighborhoods.filter((neighborhood, index, self) =>
          index === self.findIndex(n => n.id === neighborhood.id)
        );

        setNeighborhoods(uniqueNeighborhoods);
        
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
