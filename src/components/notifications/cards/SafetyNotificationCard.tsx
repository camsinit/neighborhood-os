
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for safety alerts and updates.
 * Uses conversational language and clear visual indicators.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";
import { AlertTriangle } from "lucide-react";
import { NotificationBadge } from "../elements";

interface SafetyNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const SafetyNotificationCard: React.FC<SafetyNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Get the safety update type
  const safetyType = notification.context?.safetyType || 'alert';
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create natural language sentence for the notification
  const createNaturalSentence = () => {
    const safetyTitle = notification.title || "a safety update";
    
    // Remove any "safety alert:" prefix if present
    const cleanTitle = safetyTitle.replace(/^safety alert:\s*/i, "");
    
    // Create different sentences based on safety type
    if (safetyType === 'emergency') {
      return `${actorName} reported emergency ${cleanTitle}`;
    } else if (safetyType === 'alert') {
      return `${actorName} posted safety alert ${cleanTitle}`;
    } else if (safetyType === 'info') {
      return `${actorName} shared safety info ${cleanTitle}`;
    } else {
      // Default format
      return `${actorName} posted safety update ${cleanTitle}`;
    }
  };
  
  // Create the natural language sentence
  const naturalSentence = createNaturalSentence();
  
  // Override the notification title with our sentence format
  const notificationWithSentence = {
    ...notification,
    title: naturalSentence
  };
  
  // Handle viewing safety details
  const handleViewSafety = async () => {
    // Navigate to the safety details
    highlightItem('safety', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentence}
      onAction={handleViewSafety}
      onDismiss={onDismiss}
    >
      {/* Add urgency indicator for emergency notifications */}
      {safetyType === 'emergency' && (
        <div className="mt-1">
          <NotificationBadge 
            label="EMERGENCY"
            variant="destructive"
            className="font-medium text-xs uppercase"
          />
        </div>
      )}
      
      {/* Add a general badge for alert type */}
      {safetyType !== 'emergency' && (
        <div className="mt-1">
          <NotificationBadge 
            label={safetyType === 'alert' ? 'Alert' : 'Info'}
            variant="outline"
            className="font-normal text-xs"
          />
        </div>
      )}
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
