
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
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect
}) => {
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
