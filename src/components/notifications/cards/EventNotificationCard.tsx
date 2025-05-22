
/**
 * EventNotificationCard.tsx
 * 
 * Specialized notification card for event-related notifications.
 * Uses clean, simple sentences for events.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { highlightItem } from "@/utils/highlight";
import { NotificationBadge } from "../elements";

interface EventNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const EventNotificationCard: React.FC<EventNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Extract event info from notification metadata if available
  const eventTime = notification.context?.eventTime ? 
    new Date(notification.context.eventTime) : null;
  const eventLocation = notification.context?.location;
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "Someone";
  
  // Create clean sentence-style title based on action type
  const createSimpleTitle = () => {
    // Get the event name from the title, removing any prefixes
    const eventName = notification.title.replace(/^(.+?) (posted|shared|created|updated|is hosting)\s*/i, "") || "an event";
    const actionType = notification.action_type || "create";
    
    // Simple sentence formats based on action type - WITHOUT the neighbor name prefix
    // (the neighbor name will be added by NotificationCard)
    switch(actionType) {
      case "create":
      case "share":
        return `is hosting ${eventName}`;
      case "update":
        return `updated ${eventName}`;
      case "rsvp":
        return `is attending ${eventName}`;
      case "cancel":
        return `cancelled ${eventName}`;
      default:
        return `is hosting ${eventName}`;
    }
  };
  
  // Create the simple title
  const simpleTitle = createSimpleTitle();
  
  // Override the notification title with our simplified format
  const notificationWithSimpleTitle = {
    ...notification,
    title: simpleTitle
  };
  
  // Handle viewing event details
  const handleViewEvent = () => {
    // Navigate to the event details
    highlightItem('event', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSimpleTitle}
      onAction={handleViewEvent}
      onDismiss={onDismiss}
    >
      {/* Show event specific details as secondary information */}
      {eventTime && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{format(eventTime, 'PPp')}</span>
        </div>
      )}
      
      {/* Location badge */}
      {eventLocation && (
        <div className="mt-1">
          <NotificationBadge 
            label={eventLocation}
            variant="outline"
            className="font-normal text-xs"
          />
        </div>
      )}
    </NotificationCard>
  );
};

export default EventNotificationCard;
