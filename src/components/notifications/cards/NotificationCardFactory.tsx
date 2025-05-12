
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that creates the appropriate notification card based on the type
 * Now integrating the new minimalist notification design
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationItem from "../items/NotificationItem"; // Import our minimalist item component

// Props for the NotificationCardFactory component
interface NotificationCardFactoryProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Factory component that creates the appropriate notification card based on the notification type
 * This is the entry point for creating notification cards
 * Now using our new minimalist NotificationItem for all notifications
 */
export const NotificationCardFactory: React.FC<NotificationCardFactoryProps> = ({
  notification,
  onDismiss
}) => {
  // Use our new NotificationItem component for all notifications
  return (
    <NotificationItem
      notification={notification}
      onSelect={onDismiss}
    />
  );
};

export default NotificationCardFactory;

// Export NotificationCard for backward compatibility
export { default as NotificationCard } from './base/NotificationCard';
export type { NotificationCardProps } from './base/NotificationCard';
