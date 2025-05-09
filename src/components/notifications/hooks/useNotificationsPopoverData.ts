
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook to fetch notification data for the notifications popover
 * Now with enhanced processing of notification descriptions
 */
import { useQuery } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { BaseNotification } from "@/hooks/notifications/types";

/**
 * Processes notifications to add descriptive texts based on type
 * @param notifications The raw notifications to process
 * @returns Processed notifications with descriptive action verbs and object types
 */
const processNotificationDescriptions = (notifications: BaseNotification[]): BaseNotification[] => {
  return notifications.map(notification => {
    // Clone the notification to avoid mutating the original
    const processedNotification = { ...notification };
    
    // If the notification already has these fields, don't modify
    if (processedNotification.context?.actionVerb && processedNotification.context?.objectType) {
      return processedNotification;
    }
    
    // Default values for different notification types
    switch (notification.notification_type) {
      case "event":
        processedNotification.context = {
          ...processedNotification.context,
          actionVerb: processedNotification.context?.actionType || "created",
          objectType: "an event"
        };
        break;
      case "safety":
        processedNotification.context = {
          ...processedNotification.context,
          actionVerb: "posted",
          objectType: "a safety update" 
        };
        break;
      case "skills":
        if (processedNotification.context?.contextType === 'skill_request') {
          processedNotification.context = {
            ...processedNotification.context,
            actionVerb: "requested",
            objectType: "a skill session"
          };
        } else {
          processedNotification.context = {
            ...processedNotification.context,
            actionVerb: processedNotification.context?.sessionStatus === "confirmed" ? "confirmed" : "scheduled",
            objectType: "a skill session"
          };
        }
        break;
      case "goods":
        processedNotification.context = {
          ...processedNotification.context,
          actionVerb: processedNotification.context?.actionType || "posted",
          objectType: processedNotification.context?.itemType || "an item"
        };
        break;
      case "neighbors":
        processedNotification.context = {
          ...processedNotification.context,
          actionVerb: "joined",
          objectType: "the neighborhood"
        };
        break;
      default:
        // Generic fallback
        processedNotification.context = {
          ...processedNotification.context,
          actionVerb: "updated",
          objectType: notification.notification_type
        };
    }
    
    return processedNotification;
  });
};

/**
 * Custom hook that provides notification data for the popover
 * @param showArchived Whether to show archived notifications
 * @returns Query result with processed notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Leverage our main notifications hook
  const notificationsQuery = useNotifications(showArchived);
  
  // Process the notifications to add descriptive texts if they have data
  const processedData = notificationsQuery.data 
    ? processNotificationDescriptions(notificationsQuery.data)
    : undefined;
    
  return {
    ...notificationsQuery,
    data: processedData
  };
};
