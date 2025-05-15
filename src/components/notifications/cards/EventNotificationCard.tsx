
/**
 * EventNotificationCard.tsx
 * 
 * Specialized notification card for event-related updates.
 * Uses sentence-style formatting with natural language.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { Calendar } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { createLogger } from "@/utils/logger";

// Initialize logger for this component
const logger = createLogger('EventNotificationCard');

interface EventNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const EventNotificationCard: React.FC<EventNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Get event type from context or fallback to generic
  const eventType = notification.context?.eventType || 'event';
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with proper subject-verb-object structure
  const createSentenceTitle = () => {
    const eventTitle = notification.context?.eventTitle || 
      notification.title || "an event";
      
    // Different messages based on event action
    if (notification.action_type === 'rsvp') {
      return `${actorName} RSVPed to ${eventTitle}`;
    } else if (notification.action_type === 'cancel') {
      return `${actorName} cancelled ${eventTitle}`;
    } else if (notification.action_type === 'update') {
      return `${actorName} updated ${eventTitle}`;
    } else if (notification.action_type === 'create') {
      return `${actorName} created ${eventTitle}`;
    } else {
      // Fallback format
      return `${actorName} interacted with ${eventTitle}`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing the event details
  const handleViewEvent = () => {
    try {
      // Navigate to the event details using the highlightItem utility
      if (notification.content_id) {
        highlightItem('event', notification.content_id);
      }
      
      // Dismiss the notification if callback provided
      if (onDismiss) onDismiss();
    } catch (error) {
      logger.error("Error navigating to event:", error);
    }
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewEvent}
      onDismiss={onDismiss}
    >
      {notification.context?.eventDate && (
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1 inline" />
          <span>{notification.context.eventDate}</span>
        </div>
      )}
    </NotificationCard>
  );
};

export default EventNotificationCard;
