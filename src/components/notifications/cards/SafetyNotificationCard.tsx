
/**
 * SafetyNotificationCard.tsx
 * 
 * Specialized notification card for safety alerts and updates.
 * Now with clean language highlighting content in red, minimal badges.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";
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
  
  // Handle viewing safety details
  const handleViewSafety = () => {
    // Navigate to the safety details
    highlightItem('safety', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewSafety}
      onDismiss={onDismiss}
    >
      {/* Only show emergency badge for truly urgent notifications */}
      {safetyType === 'emergency' && (
        <div className="mt-1">
          <NotificationBadge 
            label="EMERGENCY"
            variant="destructive"
            className="font-medium text-xs uppercase"
          />
        </div>
      )}
    </NotificationCard>
  );
};

export default SafetyNotificationCard;
