
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for safety alerts and updates.
 * Uses simple, clear language without redundancy.
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
  
  // Create clean, simple sentence for the notification
  const createSimpleTitle = () => {
    // Clean the title by removing redundant prefixes
    const cleanTitle = notification.title.replace(/^(safety alert:|safety update:|safety info:)\s*/i, "");
    
    // Create different sentences based on safety type - simple and direct
    if (safetyType === 'emergency') {
      return `${actorName} reported emergency: ${cleanTitle}`;
    } else if (safetyType === 'alert') {
      return `${actorName} reported ${cleanTitle}`;
    } else if (safetyType === 'info') {
      return `${actorName} shared safety info: ${cleanTitle}`;
    } else {
      // Default clean format
      return `${actorName} reported ${cleanTitle}`;
    }
  };
  
  // Create the simple title
  const simpleTitle = createSimpleTitle();
  
  // Override the notification title with our clean format
  const notificationWithSimpleTitle = {
    ...notification,
    title: simpleTitle
  };
  
  // Handle viewing safety details
  const handleViewSafety = () => {
    // Navigate to the safety details
    highlightItem('safety', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSimpleTitle}
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
