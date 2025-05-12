
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that creates the appropriate notification card based on the type
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import SafetyNotificationCard from "./SafetyNotificationCard";
import EventNotificationCard from "./EventNotificationCard";
import SkillSessionNotificationCard from "./SkillSessionNotificationCard";
import GoodsNotificationCard from "./GoodsNotificationCard";
import NeighborNotificationCard from "./NeighborNotificationCard";

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
  // Choose the appropriate card based on notification type
  // This preserves the rich contextual information in specialized cards
  const notificationType = notification.notification_type?.toLowerCase() || '';
  
  // Use specialized cards based on notification type
  if (notificationType === 'safety') {
    return <SafetyNotificationCard notification={notification} onDismiss={onDismiss} />;
  }
  
  if (notificationType === 'event') {
    return <EventNotificationCard notification={notification} onDismiss={onDismiss} />;
  }
  
  if (notificationType === 'skills' && notification.action_type === 'session') {
    return <SkillSessionNotificationCard notification={notification} onDismiss={onDismiss} />;
  }
  
  if (notificationType === 'goods') {
    return <GoodsNotificationCard notification={notification} onDismiss={onDismiss} />;
  }
  
  if (notificationType === 'neighbors') {
    return <NeighborNotificationCard notification={notification} onDismiss={onDismiss} />;
  }
  
  // Fall back to base notification card for other types
  return (
    <NotificationCard 
      notification={notification}
      onDismiss={onDismiss}
    >
      {notification.description && (
        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
      )}
    </NotificationCard>
  );
};

export default NotificationCardFactory;
export { NotificationCard };
export type { NotificationCardProps } from './base/NotificationCard';
