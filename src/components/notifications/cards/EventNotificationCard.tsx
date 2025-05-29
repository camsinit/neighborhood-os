
/**
 * EventNotificationCard.tsx
 * 
 * Specialized notification card for event-related notifications.
 * Now with clean language and no badges - just highlights event names in blue.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";

interface EventNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const EventNotificationCard: React.FC<EventNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Handle viewing event details
  const handleViewEvent = () => {
    // Navigate to the event details
    highlightItem('event', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewEvent}
      onDismiss={onDismiss}
    />
  );
};

export default EventNotificationCard;
