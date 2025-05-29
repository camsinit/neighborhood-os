
/**
 * GoodsNotificationCard.tsx
 * 
 * Specialized notification card for goods exchange notifications.
 * Now with clean language highlighting item names in orange.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";

interface GoodsNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const GoodsNotificationCard: React.FC<GoodsNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Handle viewing goods details
  const handleViewGoods = () => {
    // Navigate to the goods details
    highlightItem('goods', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewGoods}
      onDismiss={onDismiss}
    />
  );
};

export default GoodsNotificationCard;
