
/**
 * EventNotificationCard.tsx
 * 
 * Specialized notification card for event-related notifications.
 * Includes event details and RSVP functionality.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { highlightItem } from "@/utils/highlight";

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
      {/* Event specific details */}
      {eventTime && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{format(eventTime, 'PPp')}</span>
        </div>
      )}
      
      {eventLocation && (
        <div className="mt-1">
          <Badge variant="outline" className="font-normal text-xs">
            {eventLocation}
          </Badge>
        </div>
      )}
    </NotificationCard>
  );
};

export default EventNotificationCard;
