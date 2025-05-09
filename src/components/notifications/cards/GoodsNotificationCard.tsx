
/**
 * GoodsNotificationCard.tsx
 * 
 * Specialized notification card for goods exchange notifications.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { highlightItem } from "@/utils/highlight";

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
      {/* Goods specific details */}
      <div className="mt-1 flex items-start gap-1">
        <ShoppingCart className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          {notification.context?.summary || "New activity in the goods exchange"}
        </p>
      </div>
      
      <div className="mt-1 flex gap-1 flex-wrap">
        {itemCategory && (
          <Badge variant="outline" className="font-normal text-xs">
            {itemCategory}
          </Badge>
        )}
        
        {itemCondition && (
          <Badge variant="outline" className="font-normal text-xs">
            {itemCondition}
          </Badge>
        )}
      </div>
    </NotificationCard>
  );
};

export default GoodsNotificationCard;
