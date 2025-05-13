
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook to fetch notification data for the notifications popover
 * Now with enhanced refresh functionality
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Custom hook that provides notification data for the popover
 * @param showArchived Whether to show archived notifications
 * @returns Query result with notification data and a refresh function
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Get the query client for manual refreshes
  const queryClient = useQueryClient();
  
  // Leverage our main notifications hook with specific options for better refresh behavior
  const notificationsQuery = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async () => {
      // Import the fetchAllNotifications function directly
      const { fetchAllNotifications } = await import('@/hooks/notifications/fetchNotifications');
      logger.debug(`Fetching notifications, showArchived: ${showArchived}`);
      return fetchAllNotifications(showArchived);
    },
    // Add these options for better refresh behavior
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 30, // Consider data stale after 30 seconds
  });
  
  // Create a refresh function that invalidates the cache and refetches
  const refreshNotifications = () => {
    // Invalidate the notifications query cache
    logger.debug(`Manually invalidating notifications cache`);
    queryClient.invalidateQueries({
      queryKey: ["notifications"]
    });
    
    // Force a refetch
    logger.debug(`Manually triggering notifications refetch`);
    notificationsQuery.refetch();
    
    logger.info("[useNotificationsPopoverData] Manually refreshed notifications");
  };
  
  // Return the query result along with the refresh function
  return {
    ...notificationsQuery,
    refreshNotifications
  };
};
