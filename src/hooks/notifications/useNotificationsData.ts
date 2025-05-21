
/**
 * useNotificationsData.ts
 * 
 * Core hook for fetching notification data with React Query
 * Handles the basic data fetching needs
 */
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { BaseNotification } from "@/hooks/notifications/types";
import { fetchDirectNotifications } from "@/hooks/notifications/fetchDirectNotifications";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsData');

/**
 * Base hook for notification data fetching
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsData = (showArchived: boolean): UseQueryResult<BaseNotification[], Error> => {
  // Use React Query with standard settings
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: () => {
      logger.debug('Fetching notifications, showArchived:', showArchived);
      return fetchDirectNotifications(showArchived);
    },
    // Set up automatic polling with short interval for better responsiveness
    refetchInterval: 10000, // 10 seconds polling
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 3
  });
};
