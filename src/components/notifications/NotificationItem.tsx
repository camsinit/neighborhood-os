
/**
 * Main NotificationItem component that now uses the universal pathway
 * for ALL notification types - no more redundant specialized components
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import UniversalNotificationItem from "./items/UniversalNotificationItem";

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * Simple router component that now uses the universal notification item
 * for all notification types, ensuring consistent formatting and behavior
 */
const NotificationItemRouter = ({ notification, onSelect }: NotificationItemProps) => {
  // All notifications now use the universal component
  return (
    <UniversalNotificationItem
      notification={notification}
      onSelect={onSelect}
    />
  );
};

export default NotificationItemRouter;
