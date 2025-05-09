
/**
 * NotificationCardFactory.tsx
 * 
 * Factory component that renders the appropriate specialized notification card
 * based on the notification type and context.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import EventNotificationCard from "./EventNotificationCard";
import SafetyNotificationCard from "./SafetyNotificationCard";
import SkillRequestNotificationCard from "./SkillRequestNotificationCard";
import SkillSessionNotificationCard from "./SkillSessionNotificationCard";
import GoodsNotificationCard from "./GoodsNotificationCard";
import NeighborNotificationCard from "./NeighborNotificationCard";

interface NotificationCardFactoryProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NotificationCardFactory: React.FC<NotificationCardFactoryProps> = ({
  notification,
  onDismiss,
}) => {
  // Determine which specialized card to use based on notification type and context
  const notificationType = notification.notification_type;
  const contextType = notification.context?.contextType;
  
  // Select the appropriate card component based on type and context
  switch (notificationType) {
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
      // For skills, we need to check the context to determine the specific card type
      if (contextType === "skill_request") {
        return (
          <SkillRequestNotificationCard 
            notification={notification} 
            onDismiss={onDismiss} 
          />
        );
      } else {
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
      
    // Default case - use the base notification card
    default:
      return (
        <NotificationCard 
          notification={notification} 
          onDismiss={onDismiss} 
        />
      );
  }
};

export default NotificationCardFactory;
