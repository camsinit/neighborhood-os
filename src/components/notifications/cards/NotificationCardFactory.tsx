
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that creates the appropriate notification card based on the type
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";

// Props for the NotificationCardFactory component
interface NotificationCardFactoryProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Factory component that creates the appropriate notification card based on the notification type
 * This is the entry point for creating notification cards
 */
export const NotificationCardFactory: React.FC<NotificationCardFactoryProps> = ({
  notification,
  onDismiss
}) => {
  // For now, we'll use the base NotificationCard for all types
  // In the future, we can create specialized card components for each notification type
  return (
    <NotificationCard 
      notification={notification}
      onDismiss={onDismiss}
    />
  );
};

export default NotificationCardFactory;
export { NotificationCard };
export type { NotificationCardProps } from './base/NotificationCard';
