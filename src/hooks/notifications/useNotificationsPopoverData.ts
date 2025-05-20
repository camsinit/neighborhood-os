
/**
 * useNotificationsPopoverData.ts
 * 
 * Simplified hook to fetch notification data for the notifications popover
 * Combines the base data hook with refresh functionality
 */
import { useNotificationsData } from "./useNotificationsData";
import { useNotificationsRefresh } from "./useNotificationsRefresh";
import { UseQueryResult } from "@tanstack/react-query";
import { BaseNotification } from "./types";

/**
 * Custom hook that provides notification data for the popover
 * with automatic refresh capabilities
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean): UseQueryResult<BaseNotification[], Error> => {
  // Use the base notifications data hook
  const query = useNotificationsData(showArchived);
  
  // Add refresh listeners - only passing the refetch function
  // which is the only parameter expected by useNotificationsRefresh
  useNotificationsRefresh({ 
    refetch: query.refetch
  });
  
  // Return the query result
  return query;
};
