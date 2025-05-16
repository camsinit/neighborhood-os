
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for community updates and alerts.
 * Includes prominent visual indicators for urgency.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";

interface SafetyNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const SafetyNotificationCard: React.FC<SafetyNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Get the update type
  const updateType = notification.context?.safetyType || 'alert';
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with proper subject-verb-object structure
  const createSentenceTitle = () => {
    const updateTitle = notification.title || "a community update";
    
    // Customize text based on update type
    if (updateType === 'Emergency') {
      return `${actorName} reported EMERGENCY: ${updateTitle}`;
    } else if (updateType === 'Alert') {
      return `${actorName} posted important alert: ${updateTitle}`;
    } else if (updateType === 'Infrastructure') {
      return `${actorName} shared infrastructure update: ${updateTitle}`;
    } else if (updateType === 'Maintenance') {
      return `${actorName} posted maintenance notice: ${updateTitle}`;
    } else {
      // Fallback format
      return `${actorName} posted community update: ${updateTitle}`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing update details
  const handleViewUpdate = async () => {
    // Navigate to the update details
    highlightItem('safety', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewUpdate}
      onDismiss={onDismiss}
    />
  );
};

export default SafetyNotificationCard;
