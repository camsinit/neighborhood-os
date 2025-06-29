
/**
 * This module provides the main hook for fetching and managing neighborhood activities
 * It has been refactored for better maintainability and code organization
 * Now properly filters by current neighborhood
 */
import { useQuery } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { Activity, ActivityType, ActivityMetadata } from "./activities/types";
import { supabase } from "@/integrations/supabase/client";

// Re-export types for backward compatibility
export type { Activity, ActivityType, ActivityMetadata };

/**
 * Fetch activities with proper neighborhood filtering
 */
const fetchActivities = async (neighborhoodId: string | null): Promise<Activity[]> => {
  if (!neighborhoodId) return [];
  
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      created_at,
      neighborhood_id,
      metadata,
      is_public,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  
  return (activities || []).filter(activity => {
    if (!activity.metadata) return true;
    const metadata = activity.metadata as any;
    return !metadata?.deleted;
  });
};

/**
 * Custom hook for fetching recent neighborhood activities
 */
export const useActivities = () => {
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    queryKey: ["activities", neighborhood?.id],
    queryFn: () => fetchActivities(neighborhood?.id || null),
    enabled: !!neighborhood?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
