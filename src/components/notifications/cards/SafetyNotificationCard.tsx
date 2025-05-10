
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
  
  // Create descriptive text based on safety type and integrate the safety type directly
  let actionText = '';
  
  // Capitalize the first letter of safety type for better readability
  const formattedSafetyType = safetyType.charAt(0).toUpperCase() + safetyType.slice(1);
  
  if (safetyType === 'emergency') {
    // For emergencies, emphasize the urgency
    actionText = `${actorName} reported an EMERGENCY situation`;
  } else if (safetyType === 'alert') {
    // For alerts
    actionText = `${actorName} shared a safety alert`;
  } else if (safetyType === 'info') {
    // For informational updates
    actionText = `${actorName} shared safety information`;
  } else {
    // Fallback with the formatted type included
    actionText = `${actorName} posted a ${formattedSafetyType} safety update`;
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
      {/* Safety action description using our reusable component with integrated safety type */}
      <NotificationDescription
        text={actionText}
        type="safety"
        icon={AlertTriangle}
        iconColor="red-500"
      />
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
