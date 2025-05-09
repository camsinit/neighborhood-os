
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for safety alerts and updates.
 * Includes prominent visual indicators for urgency.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { AlertTriangle } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { 
  NotificationBadge
} from "../elements";
import { cn } from "@/lib/utils";  // Add the missing import

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
  
  // Create sentence-style title with highlighted safety update title
  const createSentenceTitle = () => {
    const safetyTitle = notification.title || "a safety update";
    
    // Customize text based on safety type
    if (safetyType === 'emergency') {
      return `${actorName} reported EMERGENCY: [[${safetyTitle}]]`;
    } else if (safetyType === 'alert') {
      return `${actorName} posted safety alert: [[${safetyTitle}]]`;
    } else if (safetyType === 'info') {
      return `${actorName} shared safety info: [[${safetyTitle}]]`;
    } else {
      // Fallback format
      return `${actorName} posted safety update: [[${safetyTitle}]]`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing safety details
  const handleViewSafety = async () => {
    // Navigate to the safety details
    highlightItem('safety', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewSafety}
      onDismiss={onDismiss}
      className={!notification.is_read ? "border-l-red-500" : ""}
    >
      {/* Show safety type as a badge */}
      <div className="mt-1">
        <NotificationBadge 
          label={safetyType.charAt(0).toUpperCase() + safetyType.slice(1)}
          variant="outline"
          className={cn(
            "font-normal text-xs",
            safetyType === 'emergency' && "bg-red-100 text-red-800 border-red-200"
          )}
        />
      </div>
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
