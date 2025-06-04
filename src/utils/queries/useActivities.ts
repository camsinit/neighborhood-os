
/**
 * This module provides the main hook for fetching and managing neighborhood activities
 * It has been refactored for better maintainability and code organization
 * 
 * UPDATED: Now properly includes neighborhood ID in query key and uses enhanced service
 */
import { useQuery } from "@tanstack/react-query";
import { fetchActivitiesForNeighborhood } from "./activities/activityServiceWithNeighborhood";
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
 * 
 * UPDATED: Now includes current neighborhood ID in query key for proper refetching
 */
export const useActivities = () => {
  // Get the current neighborhood to include in query key
  const currentNeighborhood = useCurrentNeighborhood();
  
  return useQuery({
    // Include neighborhood ID in query key so data refetches when neighborhood changes
    queryKey: ["activities", currentNeighborhood?.id],
    queryFn: () => {
      if (!currentNeighborhood?.id) {
        throw new Error("No neighborhood selected");
      }
      return fetchActivitiesForNeighborhood(currentNeighborhood.id);
    },
    // Only enable the query if we have a current neighborhood
    enabled: !!currentNeighborhood?.id,
    // Use a shorter stale time to refresh more frequently
    staleTime: 30000, // 30 seconds
    // Add a refetch interval for automatic updates
    refetchInterval: 60000, // 1 minute
  });
};
