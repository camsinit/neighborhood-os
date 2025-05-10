
/**
 * GoodsNotificationCard.tsx
 * 
 * Specialized notification card for goods exchange notifications.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { ShoppingCart } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { 
  NotificationBadge,
  NotificationDescription
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
  
  // Create descriptive text based on goods action type
  let actionText = `${actorName} posted an item`;
  if (requestType.includes("offer")) {
    actionText = `${actorName} offered an item`;
  } else if (requestType.includes("request")) {
    actionText = `${actorName} requested an item`;
  } else if (notification.action_type === "claim") {
    actionText = `${actorName} claimed your item`;
  } else if (notification.action_type === "cancel") {
    actionText = `${actorName} removed an item listing`;
  }
  
  // Handle viewing goods details
  const handleViewGoods = async () => {
    // Navigate to the goods details
    highlightItem('goods', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewGoods}
      onDismiss={onDismiss}
    >
      {/* Goods action description using our reusable component */}
      <NotificationDescription
        text={actionText}
        type="goods"
        icon={ShoppingCart}
        iconColor="amber-500"
      />
      
      {/* Category and condition badges using our reusable component */}
      <div className="mt-1 flex gap-1 flex-wrap">
        {itemCategory && (
          <NotificationBadge 
            label={itemCategory}
            variant="outline"
            className="font-normal text-xs"
          />
        )}
        
        {itemCondition && (
          <NotificationBadge 
            label={itemCondition}
            variant="outline"
            className="font-normal text-xs"
          />
        )}
      </div>
    </NotificationCard>
  );
};

export default GoodsNotificationCard;
