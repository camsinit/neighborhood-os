
/**
 * Unified Activities Hook
 * 
 * Consolidates all activity-related queries into a single, efficient hook
 * with real-time updates and optimized caching
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useEffect, useState } from "react";
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
 * Now supports pagination with offset and limit parameters
 */
const fetchActivities = async (
  neighborhoodId: string | null, 
  limit: number = 20, 
  offset: number = 0
): Promise<Activity[]> => {
  if (!neighborhoodId) return [];
  
  // Single optimized query with all necessary joins and pagination support
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
    .range(offset, offset + limit - 1); // Supabase uses range for pagination

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
 * Main activities hook with real-time updates (original behavior)
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

/**
 * Hook for paginated activities with load more functionality
 * Returns activities with ability to load more older items
 */
export const usePaginatedActivities = () => {
  const neighborhood = useCurrentNeighborhood();
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  // Initial load of activities
  const query = useQuery({
    queryKey: ["activities", neighborhood?.id],
    queryFn: () => fetchActivities(neighborhood?.id || null, 20, 0),
    enabled: !!neighborhood?.id,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  });

  // Update allActivities when initial data changes
  useEffect(() => {
    if (query.data) {
      setAllActivities(query.data);
      // If we got fewer than 20 items, there's no more data
      setHasMoreData(query.data.length >= 20);
    }
  }, [query.data]);

  // Function to load more activities
  const loadMoreActivities = async () => {
    if (!neighborhood?.id || isLoadingMore || !hasMoreData) return;
    
    setIsLoadingMore(true);
    try {
      const moreActivities = await fetchActivities(
        neighborhood.id, 
        20, 
        allActivities.length
      );
      
      if (moreActivities.length === 0) {
        setHasMoreData(false);
      } else {
        // Filter out any duplicates based on ID
        const newActivities = moreActivities.filter(
          newActivity => !allActivities.some(existing => existing.id === newActivity.id)
        );
        setAllActivities(prev => [...prev, ...newActivities]);
        
        // If we got fewer than 20 new items, there's no more data
        if (moreActivities.length < 20) {
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.error('Error loading more activities:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Set up real-time subscription for activities
  useEffect(() => {
    if (!neighborhood?.id) return;
    
    const channel = supabase
      .channel('activities-changes-paginated')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `neighborhood_id=eq.${neighborhood.id}`
        },
        () => {
          // When new activities are added, refetch the initial page
          // This keeps the most recent activities up to date
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhood?.id, query]);
  
  return {
    data: allActivities,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    loadMoreActivities,
    isLoadingMore,
    hasMoreData,
    error: query.error
  };
};
