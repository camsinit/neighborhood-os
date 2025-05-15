
/**
 * Custom hook for fetching notifications
 * This hook centralizes the logic for fetching different notification types
 * and combines them into a unified list
 */
import { useQuery } from "@tanstack/react-query";
import { fetchAllNotifications } from "./fetchNotifications";
import { BaseNotification } from "./types";

/**
 * Custom hook that fetches notifications from multiple sources and combines them
 * 
 * @param showArchived Boolean flag to control whether to show archived notifications
 * @returns Query result containing the combined notifications
 */
export const useNotifications = (showArchived: boolean) => {
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async (): Promise<BaseNotification[]> => {
      // Use our fetchAllNotifications function to get the data
      return fetchAllNotifications(showArchived);
    }
  });
};

// Re-export the types for easier imports elsewhere
export * from "./types";
