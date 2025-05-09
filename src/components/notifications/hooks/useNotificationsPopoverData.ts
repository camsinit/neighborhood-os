
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook to fetch notification data for the notifications popover
 */
import { useQuery } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";

/**
 * Custom hook that provides notification data for the popover
 * @param showArchived Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Leverage our main notifications hook
  return useNotifications(showArchived);
};
