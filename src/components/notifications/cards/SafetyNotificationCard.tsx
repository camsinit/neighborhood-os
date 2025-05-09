
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for safety alerts and updates.
 * Includes prominent visual indicators for urgency.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { highlightItem } from "@/utils/highlight";

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
      {/* Safety action description */}
      <div className="mt-1 flex items-start gap-1">
        <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          {actionText}
        </p>
      </div>
      
      {/* Additional context if available */}
      {notification.context?.summary && (
        <p className="text-xs text-gray-600 mt-1">
          {notification.context.summary}
        </p>
      )}
      
      {safetyType && (
        <div className="mt-2">
          <Badge 
            variant={safetyType === 'emergency' ? "destructive" : "outline"} 
            className={safetyType === 'emergency' ? "font-medium" : "font-normal"}
          >
            {safetyType.toUpperCase()}
          </Badge>
        </div>
      )}
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
