
/**
 * Custom hook for fetching notifications
 * This hook centralizes the logic for fetching different notification types
 * and combines them into a unified list
 */
import { useQuery } from "@tanstack/react-query";
import { BaseNotification } from "./types";
import { notificationClient } from "@/utils/notifications/notificationClient";
import { createLogger } from "@/utils/logger";

// Create a logger for this hook
const logger = createLogger('useNotifications');

/**
 * Custom hook that fetches notifications from the unified client
 * 
 * @param showArchived Boolean flag to control whether to show archived notifications
 * @returns Query result containing notifications
 */
export const useNotifications = (showArchived: boolean) => {
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async (): Promise<BaseNotification[]> => {
      logger.debug('Fetching notifications, showArchived:', showArchived);
      // Use our unified client to fetch notifications
      return notificationClient.fetchNotifications(showArchived);
    },
    // Consistent settings for notifications queries
    refetchInterval: 30000, // 30 second polling
    refetchOnWindowFocus: true,
    retry: 2
  });
};

// Re-export the types for easier imports elsewhere
export * from "./types";
