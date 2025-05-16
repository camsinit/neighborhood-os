
/**
 * Hook for fetching the timezone of a neighborhood
 * 
 * This hook:
 * - Fetches the timezone of a specified neighborhood
 * - Provides a default timezone if none is specified
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNeighborhoodTimezone(neighborhoodId?: string) {
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>("America/Los_Angeles");

  // Get the neighborhood timezone
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (neighborhoodId) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', neighborhoodId)
          .single();
          
        if (!error && data) {
          setNeighborhoodTimezone(data.timezone || "America/Los_Angeles");
        }
      }
    };
    fetchNeighborhoodTimezone();
  }, [neighborhoodId]);

  return { neighborhoodTimezone };
}
