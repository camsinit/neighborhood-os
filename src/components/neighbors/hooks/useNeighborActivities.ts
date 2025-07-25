/**
 * Custom hook for fetching a specific neighbor's activities
 * 
 * This hook filters activities to show only those performed by a specific neighbor,
 * providing a personalized activity timeline for the neighbor profile sheet.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useEffect } from "react";
import { Activity, ActivityMetadata } from "@/utils/queries/activities/types";

/**
 * Helper function to safely cast metadata from Json to ActivityMetadata
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
 * Fetches activities for a specific neighbor (actor_id)
 * Limited to recent activities to keep the timeline focused and performant
 */
const fetchNeighborActivities = async (
  neighborhoodId: string | null, 
  neighborId: string
): Promise<Activity[]> => {
  if (!neighborhoodId || !neighborId) return [];
  
  // Query activities where this neighbor is the actor
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
    .eq('actor_id', neighborId)
    .order('created_at', { ascending: false })
    .limit(15); // Limit to last 15 activities for performance

  if (error) throw error;
  
  // Transform raw activities to properly typed Activity objects
  const activities: Activity[] = (rawActivities || [])
    .map(rawActivity => ({
      ...rawActivity,
      metadata: normalizeMetadata(rawActivity.metadata),
      profiles: rawActivity.profiles || { display_name: null, avatar_url: null }
    }))
    .filter(activity => {
      // Filter out deleted items
      const metadata = activity.metadata;
      return !metadata?.deleted;
    });

  return activities;
};

/**
 * Custom hook for neighbor-specific activities with real-time updates
 * 
 * @param neighborId - The ID of the neighbor whose activities to fetch
 * @returns Query result with neighbor's activities
 */
export const useNeighborActivities = (neighborId: string) => {
  const neighborhood = useCurrentNeighborhood();
  
  const query = useQuery({
    queryKey: ["neighbor-activities", neighborhood?.id, neighborId],
    queryFn: () => fetchNeighborActivities(neighborhood?.id || null, neighborId),
    enabled: !!neighborhood?.id && !!neighborId,
    staleTime: 30000, // 30 seconds
  });
  
  // Set up real-time subscription for this neighbor's activities
  useEffect(() => {
    if (!neighborhood?.id || !neighborId) return;
    
    const channel = supabase
      .channel(`neighbor-activities-${neighborId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `neighborhood_id=eq.${neighborhood.id},actor_id=eq.${neighborId}`
        },
        () => {
          // Refetch when this neighbor's activities change
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhood?.id, neighborId, query]);
  
  return query;
};