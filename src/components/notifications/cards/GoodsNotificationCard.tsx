
/**
 * GoodsNotificationCard.tsx
 * 
 * Specialized notification card for goods exchange notifications.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { highlightItem } from "@/utils/highlight";
import { 
  NotificationBadge
} from "../elements";

interface GoodsNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const GoodsNotificationCard: React.FC<GoodsNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Extract goods item info
  const itemCategory = notification.context?.goodsCategory;
  const itemCondition = notification.context?.condition;
  const requestType = notification.context?.contextType || "";
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with highlighted item name
  const createSentenceTitle = () => {
    const itemName = notification.title || "an item";
    
    // Different sentence formats based on context and action
    if (requestType.includes("offer")) {
      return `${actorName} is offering ${itemName}`;
    } else if (requestType.includes("request")) {
      return `${actorName} is looking for ${itemName}`;
    } else if (notification.action_type === "claim") {
      return `${actorName} claimed ${itemName}`;
    } else if (notification.action_type === "cancel") {
      return `${actorName} removed listing for ${itemName}`;
    } else {
      // Default format
      return `${actorName} posted ${itemName}`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing goods details
  const handleViewGoods = () => {
    // Navigate to the goods details
    highlightItem('goods', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewGoods}
      onDismiss={onDismiss}
    >
      {/* Category and condition badges */}
      <div className="mt-1 flex gap-1 flex-wrap">
        {notification.context?.goodsCategory && (
          <NotificationBadge 
            label={notification.context.goodsCategory}
            variant="outline"
            className="font-normal text-xs"
          />
        )}
        
        {notification.context?.condition && (
          <NotificationBadge 
            label={notification.context.condition}
            variant="outline"
            className="font-normal text-xs"
          />
        )}
      </div>
    </NotificationCard>
  );
};

export default GoodsNotificationCard;
