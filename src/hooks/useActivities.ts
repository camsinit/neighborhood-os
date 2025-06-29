
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
 * Helper function to safely cast metadata from Json to ActivityMetadata
 * This handles the type incompatibility between database Json type and our TypeScript interface
 */
const normalizeMetadata = (metadata: any): ActivityMetadata | null => {
  if (!metadata) return null;
  
  // If metadata is a string, try to parse it as JSON
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as ActivityMetadata;
    } catch {
      return null;
    }
  }
  
  // If it's already an object, cast it directly
  if (typeof metadata === 'object') {
    return metadata as ActivityMetadata;
  }
  
  return null;
};

/**
 * Optimized activity fetching function with proper type casting
 * Combines all the complex logic from multiple services into one efficient query
 */
const fetchActivities = async (neighborhoodId: string | null): Promise<Activity[]> => {
  if (!neighborhoodId) return [];
  
  // Single optimized query with all necessary joins
  const { data: rawActivities, error } = await supabase
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
  
  // Transform raw activities to properly typed Activity objects
  const activities: Activity[] = (rawActivities || [])
    .map(rawActivity => ({
      ...rawActivity,
      metadata: normalizeMetadata(rawActivity.metadata), // Safe type casting
      profiles: rawActivity.profiles || { display_name: null, avatar_url: null }
    }))
    .filter(activity => {
      // Filter out deleted items with proper type checking
      const metadata = activity.metadata;
      return !metadata?.deleted;
    });

  return activities;
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
