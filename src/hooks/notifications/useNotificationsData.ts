
/**
 * useNotificationsData.ts
 * 
 * Core hook for fetching notification data with React Query.
 * Handles the basic data fetching needs for notifications.
 * 
 * Component Integration Guide:
 * 1. Import this hook in components that need notification data
 * 2. Call the hook with the showArchived parameter
 * 3. Destructure data, isLoading, and error from the result
 * 4. Use these values to render your component
 * 5. The hook handles caching and refetching automatically
 * 
 * Hook Functionality:
 * - Fetches notifications via the notificationClient
 * - Caches results to minimize API calls
 * - Handles automatic polling for fresh data
 * - Provides loading and error states
 */
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { BaseNotification } from "@/hooks/notifications/types";
import { notificationClient } from "@/utils/notifications/notificationClient"; 
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsData');

/**
 * Base hook for notification data fetching
 * 
 * This hook provides consistent notification data fetching across the app.
 * It uses React Query for efficient data loading and caching.
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data, loading state, and error
 */
export const useNotificationsData = (showArchived: boolean): UseQueryResult<BaseNotification[], Error> => {
  // Use React Query with standard settings
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: () => {
      logger.debug('Fetching notifications, showArchived:', showArchived);
      return notificationClient.fetchNotifications(showArchived);
    },
    // Set up automatic polling with short interval for better responsiveness
    refetchInterval: 15000, // 15 seconds polling
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 3
  });
};
