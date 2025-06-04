
/**
 * This module provides the main hook for fetching and managing neighborhood activities
 * It has been refactored for better maintainability and code organization
 * Now properly filters by current neighborhood
 */
import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "./activities/activityService";
import { Activity, ActivityType, ActivityMetadata } from "./activities/types";
import { isContentDeleted } from "./activities/metadataUtils";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

// Re-export types for backward compatibility
export type { Activity, ActivityType, ActivityMetadata };
export { isContentDeleted };

/**
 * Custom hook for fetching recent neighborhood activities
 * Returns activities with synchronized titles from their source content
 * and proper handling for deleted content
 * Now properly filtered by current neighborhood
 */
export const useActivities = () => {
  // Get the current neighborhood context
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    // Include neighborhood_id in query key for proper cache isolation
    queryKey: ["activities", neighborhood?.id],
    queryFn: () => fetchActivities(neighborhood?.id || null),
    // Only run the query if we have a neighborhood
    enabled: !!neighborhood?.id,
    // Use a shorter stale time to refresh more frequently
    staleTime: 30000, // 30 seconds
    // Add a refetch interval for automatic updates
    refetchInterval: 60000, // 1 minute
  });
};
