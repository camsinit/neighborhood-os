
/**
 * EventNotificationCard.tsx
 * 
 * Specialized notification card for event-related notifications.
 * Includes event details and RSVP functionality.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { highlightItem } from "@/utils/highlight";
import { 
  NotificationBadge,
  NotificationDescription
} from "../elements";

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
  
  // Generate action text based on notification action type
  let actionText = `${actorName} shared an event`;
  if (notification.action_type === "create") {
    actionText = `${actorName} created an event`;
  } else if (notification.action_type === "update") {
    actionText = `${actorName} updated an event`;
  } else if (notification.action_type === "rsvp") {
    actionText = `${actorName} is attending an event`;
  } else if (notification.action_type === "cancel") {
    actionText = `${actorName} canceled an event`;
  }
  
  // Handle viewing event details
  const handleViewEvent = async () => {
    // Navigate to the event details
    highlightItem('event', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewEvent}
      onDismiss={onDismiss}
    >
      {/* Event action description using our new reusable component */}
      <NotificationDescription
        text={actionText}
        type="event"
        icon={Calendar}
        iconColor="blue-500"
      />
      
      {/* Event specific details */}
      {eventTime && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{format(eventTime, 'PPp')}</span>
        </div>
      )}
      
      {/* Location badge using our new reusable component */}
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
