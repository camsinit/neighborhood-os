
/**
 * NotificationItem.tsx
 * 
 * Legacy compatibility component that maintains the old API while using
 * the new notification card system underneath.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { highlightItem } from "@/utils/highlight";
import { NotificationCardFactory } from "../cards/NotificationCardFactory";

// Props for the NotificationItem component
interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * NotificationItem component - redirects to our new card factory
 * Maintained for backward compatibility
 * 
 * This component is designed to display a single notification in a modern,
 * user-friendly way with clear descriptions of the action.
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect
}) => {
  // Process the notification to ensure it has proper action text
  // This adds descriptions like "Shirah created an event" if not already present
  if (!notification.context?.actionVerb || !notification.context?.objectType) {
    switch (notification.notification_type) {
      case "event":
        notification.context = {
          ...notification.context,
          actionVerb: "created",
          objectType: "an event"
        };
        break;
      case "safety":
        notification.context = {
          ...notification.context,
          actionVerb: "posted",
          objectType: "a safety update"
        };
        break;
      case "skills":
        notification.context = {
          ...notification.context,
          actionVerb: notification.context?.contextType === 'skill_request' ? "requested" : "scheduled",
          objectType: "a skill session"
        };
        break;
      case "goods":
        notification.context = {
          ...notification.context,
          actionVerb: "posted", 
          objectType: "an item"
        };
        break;
      case "neighbors":
        notification.context = {
          ...notification.context,
          actionVerb: "joined",
          objectType: "the neighborhood"
        };
        break;
      default:
        notification.context = {
          ...notification.context,
          actionVerb: "updated",
          objectType: notification.notification_type
        };
    }
  }

  // Simply delegate to our new factory component
  return (
    <NotificationCardFactory
      notification={notification}
      onDismiss={onSelect}
    />
  );
};

// Export as default for compatibility with existing imports
export default NotificationItem;
