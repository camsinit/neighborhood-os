
/**
 * This module provides the main hook for fetching and managing neighborhood activities
 * It has been refactored for better maintainability and code organization
 */
import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "./activities/activityService";
import { Activity, ActivityType, ActivityMetadata } from "./activities/types";
import { isContentDeleted } from "./activities/metadataUtils";

// Re-export types for backward compatibility
export type { Activity, ActivityType, ActivityMetadata };
export { isContentDeleted };

/**
 * Custom hook for fetching recent neighborhood activities
 * Returns activities with synchronized titles from their source content
 * and proper handling for deleted content
 */
export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
};
