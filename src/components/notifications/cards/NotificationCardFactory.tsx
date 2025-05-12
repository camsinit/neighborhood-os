
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that creates the appropriate notification card based on the type
 * Now fully integrated with the new minimalist notification design
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationItem from "../items/NotificationItem"; 

// Props for the NotificationCardFactory component
interface NotificationCardFactoryProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Factory component that creates the appropriate notification card based on the notification type
 * This is the entry point for creating notification cards
 * Now fully integrated with our new minimalist NotificationItem design
 */
export const NotificationCardFactory: React.FC<NotificationCardFactoryProps> = ({
  notification,
  onDismiss
}) => {
  // Ensure the notification has a properly formatted title
  const prepareNotification = (notification: BaseNotification): BaseNotification => {
    // Get actor name
    const actorName = notification.profiles?.display_name || "A neighbor";
    
    // Create sentence-style titles based on notification type
    let title = notification.title;
    
    if (notification.notification_type === 'event') {
      if (notification.action_type === 'create') {
        title = `is hosting ${notification.title}`;
      } else if (notification.action_type === 'update') {
        title = `updated ${notification.title}`;
      } else if (notification.action_type === 'cancel') {
        title = `cancelled ${notification.title}`;
      } else {
        title = `shared ${notification.title}`;
      }
    }
    else if (notification.notification_type === 'goods') {
      if (notification.action_type === 'offer') {
        title = `is offering ${notification.title}`;
      } else if (notification.action_type === 'request') {
        title = `is looking for ${notification.title}`;
      } else if (notification.action_type === 'claim') {
        title = `claimed ${notification.title}`;
      } else {
        title = `posted ${notification.title}`;
      }
    }
    else if (notification.notification_type === 'skills') {
      if (notification.action_type === 'request') {
        title = `requested ${notification.title}`;
      } else if (notification.action_type === 'confirm') {
        title = `confirmed ${notification.title} session`;
      } else if (notification.action_type === 'offer') {
        title = `is sharing ${notification.title}`;
      } else {
        title = `scheduled ${notification.title}`;
      }
    }
    
    // Return modified notification with sentence-style title
    return {
      ...notification,
      title
    };
  };
  
  // Prepare notification with proper title format
  const preparedNotification = prepareNotification(notification);
  
  // Use our new NotificationItem component for all notifications
  return (
    <NotificationItem
      notification={preparedNotification}
      onSelect={onDismiss}
    />
  );
};

export default NotificationCardFactory;

// Export NotificationCard for backward compatibility
export { default as NotificationCard } from './base/NotificationCard';
export type { NotificationCardProps } from './base/NotificationCard';
