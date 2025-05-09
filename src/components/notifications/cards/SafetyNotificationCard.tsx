
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
      {/* Safety type indicator */}
      <div className="mt-1 flex items-start gap-1">
        <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          {notification.context?.summary || "Important safety information for your neighborhood"}
        </p>
      </div>
      
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
