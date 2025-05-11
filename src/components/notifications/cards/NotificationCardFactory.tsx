
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that creates the appropriate notification card based on the type
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import EventNotificationCard from "./EventNotificationCard";
import NeighborNotificationCard from "./NeighborNotificationCard";
import GoodsNotificationCard from "./GoodsNotificationCard";
import SafetyNotificationCard from "./SafetyNotificationCard";
import SkillRequestNotificationCard from "./SkillRequestNotificationCard";
import SkillSessionNotificationCard from "./SkillSessionNotificationCard";
import { NotificationCard } from "./base/NotificationCard"; // Fixed import

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
  // Determine which card component to use based on notification type and context
  switch (notification.notification_type) {
    case "event":
      return (
        <EventNotificationCard 
          notification={notification} 
          onDismiss={onDismiss} 
        />
      );
    
    case "safety":
      return (
        <SafetyNotificationCard 
          notification={notification} 
          onDismiss={onDismiss} 
        />
      );
    
    case "skills":
      // For skill notifications, further differentiate based on context
      if (notification.context?.contextType === 'skill_request') {
        return (
          <SkillRequestNotificationCard 
            notification={notification} 
            onDismiss={onDismiss} 
          />
        );
      } else {
        // Default to session card for other skill notifications
        return (
          <SkillSessionNotificationCard 
            notification={notification} 
            onDismiss={onDismiss} 
          />
        );
      }
    
    case "goods":
      return (
        <GoodsNotificationCard 
          notification={notification} 
          onDismiss={onDismiss} 
        />
      );
    
    case "neighbors":
      return (
        <NeighborNotificationCard 
          notification={notification} 
          onDismiss={onDismiss} 
        />
      );
    
    default:
      // For unsupported types, use a generic notification card
      // In a future iteration, we could create a DefaultNotificationCard for this case
      return (
        <NotificationCard 
          notification={notification}
          onDismiss={onDismiss}
        />
      );
  }
};

export default NotificationCardFactory;
export { NotificationCard } from './base/NotificationCard';
export type { NotificationCardProps } from './base/NotificationCard';
