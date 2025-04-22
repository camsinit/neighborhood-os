
import { useQuery } from "@tanstack/react-query";
import { fetchAllNotifications } from "@/hooks/notifications/fetchNotifications";

/**
 * Encapsulates the data logic for the NotificationsPopover: fetching, error handling, and sorting notifications.
 * Returns notifications, loading, error and a convenient refetch method.
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async () => {
      // Use our refactored fetchAllNotifications (all mapping logic inside)
      return fetchAllNotifications(showArchived);
    }
  });
};
