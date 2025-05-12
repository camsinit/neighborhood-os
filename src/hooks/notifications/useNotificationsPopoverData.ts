
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook to fetch notification data for the notifications popover
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";

/**
 * Custom hook that provides notification data for the popover
 * @param showArchived Whether to show archived notifications
 * @returns Query result with notification data and a refresh function
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Get the query client for manual refreshes
  const queryClient = useQueryClient();
  
  // Leverage our main notifications hook
  const notificationsQuery = useNotifications(showArchived);
  
  // Create a refresh function that invalidates the cache and refetches
  const refreshNotifications = () => {
    // Invalidate the notifications query cache
    queryClient.invalidateQueries({
      queryKey: ["notifications"]
    });
    
    // Force a refetch
    notificationsQuery.refetch();
    
    console.log("[useNotificationsPopoverData] Manually refreshed notifications");
  };
  
  // Return the query result along with the refresh function
  return {
    ...notificationsQuery,
    refreshNotifications
  };
};
