
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
  NotificationBadge,
  NotificationDescription
} from "../elements";

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
  
  // Create descriptive text based on safety type
  let actionText = `${actorName} posted a safety update`;
  if (safetyType === 'emergency') {
    actionText = `${actorName} reported an emergency situation`;
  } else if (safetyType === 'alert') {
    actionText = `${actorName} shared a safety alert`;
  } else if (safetyType === 'info') {
    actionText = `${actorName} shared safety information`;
  }
  
  // Handle viewing safety details
  const handleViewSafety = async () => {
    // Navigate to the safety details
    highlightItem('safety', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewSafety}
      onDismiss={onDismiss}
      className={!notification.is_read ? "border-l-red-500" : ""}
    >
      {/* Safety action description using our reusable component */}
      <NotificationDescription
        text={actionText}
        type="safety"
        icon={AlertTriangle}
        iconColor="red-500"
      />
      
      {/* Additional context if available */}
      {notification.context?.summary && (
        <p className="text-xs text-gray-600 mt-1">
          {notification.context.summary}
        </p>
      )}
      
      {/* Safety type badge using our reusable component */}
      {safetyType && (
        <div className="mt-2">
          <NotificationBadge 
            label={safetyType.toUpperCase()}
            variant={safetyType === 'emergency' ? "destructive" : "outline"}
            isHighlighted={safetyType === 'emergency'}
          />
        </div>
      )}
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
