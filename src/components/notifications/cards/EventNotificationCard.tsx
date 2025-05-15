
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
  NotificationBadge 
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
  
  // Create sentence-style title with subject-verb-object structure
  const createSentenceTitle = () => {
    const eventName = notification.title || "an event";
    const actionType = notification.action_type || "share";
    
    // Different sentence formats based on action type
    switch(actionType) {
      case "create":
        return `${actorName} is hosting ${eventName}`;
      case "update":
        return `${actorName} updated ${eventName}`;
      case "rsvp":
        return `${actorName} is attending ${eventName}`;
      case "cancel":
        return `${actorName} cancelled ${eventName}`;
      default:
        return `${actorName} shared ${eventName}`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing event details
  const handleViewEvent = async () => {
    // Navigate to the event details
    highlightItem('event', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
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
