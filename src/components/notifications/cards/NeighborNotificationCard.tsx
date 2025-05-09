
/**
 * NeighborNotificationCard.tsx
 * 
 * Specialized notification card for new neighbor announcements.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { NotificationDescription } from "../elements";

interface NeighborNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NeighborNotificationCard: React.FC<NeighborNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Handle viewing neighbor profile
  const handleViewNeighbor = async () => {
    // Navigate to the neighbors section and highlight this neighbor
    highlightItem('neighbors', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  // Extract actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create descriptive text based on action type
  const actionText = notification.action_type === "join" 
    ? `${actorName} joined your neighborhood`
    : `${actorName} updated their profile`;

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewNeighbor}
      onDismiss={onDismiss}
    >
      {/* Descriptive text using our reusable component */}
      <NotificationDescription
        text={actionText}
        type="neighbors"
        icon={UserPlus}
        iconColor="purple-500"
      />
      
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
