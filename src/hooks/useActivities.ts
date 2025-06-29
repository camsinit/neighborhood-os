
/**
 * Unified Activities Hook
 * 
 * Consolidates all activity-related queries into a single, efficient hook
 * with real-time updates and optimized caching
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useEffect } from "react";
import { Activity, ActivityType, ActivityMetadata } from "@/utils/queries/activities/types";

// Re-export types for consistency
export type { Activity, ActivityType, ActivityMetadata };

/**
 * Optimized activity fetching function
 * Combines all the complex logic from multiple services into one efficient query
 */
const fetchActivities = async (neighborhoodId: string | null): Promise<Activity[]> => {
  if (!neighborhoodId) return [];
  
  // Single optimized query with all necessary joins
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
  
  // Filter out deleted items with proper type checking
  return (activities || []).filter(activity => {
    if (!activity.metadata) return true;
    // Safe type checking for metadata
    const metadata = activity.metadata as any;
    return !metadata?.deleted;
  });
};

/**
 * Main activities hook with real-time updates
 */
export const useActivities = () => {
  const neighborhood = useCurrentNeighborhood();
  
  const query = useQuery({
    queryKey: ["activities", neighborhood?.id],
    queryFn: () => fetchActivities(neighborhood?.id || null),
    enabled: !!neighborhood?.id,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  });
  
  // Set up real-time subscription for activities
  useEffect(() => {
    if (!neighborhood?.id) return;
    
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `neighborhood_id=eq.${neighborhood.id}`
        },
        () => {
          // Refetch when activities change
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhood?.id, query]);
  
  return query;
};
