
/**
 * NeighborNotificationCard.tsx
 * 
 * Specialized notification card for new neighbor announcements.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { highlightItem } from "@/utils/highlight";

interface NeighborNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NeighborNotificationCard: React.FC<NeighborNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Set action verb and object type for this notification
  notification.context = {
    ...notification.context,
    actionVerb: "joined",
    objectType: "the neighborhood"
  };
  
  // Handle viewing neighbor profile
  const handleViewNeighbor = async () => {
    // Navigate to the neighbors section and highlight this neighbor
    highlightItem('neighbors', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewNeighbor}
      onDismiss={onDismiss}
    >
      {/* Neighbor specific details */}
      <div className="mt-1 flex items-start gap-1">
        <UserPlus className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">
          {notification.context?.summary || "A new neighbor has joined your community"}
        </p>
      </div>
      
      {/* Welcome/Visit profile button */}
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs py-0 h-7"
          onClick={handleViewNeighbor}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          View Profile
        </Button>
      </div>
    </NotificationCard>
  );
};

export default NeighborNotificationCard;
