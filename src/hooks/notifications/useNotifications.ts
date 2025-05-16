
/**
 * Custom hook for fetching notifications
 * 
 * This hook centralizes the logic for fetching different notification types
 * and combines them into a unified list.
 * 
 * Component Integration Guide:
 * 1. Import this hook in any component that needs notifications
 * 2. Call the hook with showArchived parameter
 * 3. Destructure data, isLoading, and error from the result
 * 4. Use these values to render your notifications UI
 * 5. The hook handles all the complexity of data fetching
 * 
 * Data Flow:
 * 1. Component calls useNotifications(showArchived)
 * 2. Hook fetches notifications from unified client
 * 3. Client handles authentication and database interaction
 * 4. Hook returns query result with data, loading state, and error
 * 5. React Query handles caching and automatic refetching
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
 * This hook provides a clean API for components to get notification data.
 * It uses React Query to handle caching, loading states, and refetching.
 * 
 * @param showArchived Boolean flag to control whether to show archived notifications
 * @returns Query result containing notifications, loading state, and error
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
