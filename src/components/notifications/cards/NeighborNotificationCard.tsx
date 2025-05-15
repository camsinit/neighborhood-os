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
import { cn } from "@/lib/utils";

interface NeighborNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NeighborNotificationCard: React.FC<NeighborNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Handle viewing neighbor profile - fixed highlightItem call
  const handleViewNeighbor = async () => {
    // Navigate to the neighbors section and highlight this neighbor
    highlightItem('neighbors', notification.content_id);
    
    if (onDismiss) onDismiss();
  };

  // Extract actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with highlighted neighbor name
  const createSentenceTitle = () => {
    // For join notifications, highlight the neighbor name
    if (notification.action_type === "join") {
      return `[[${actorName}]] joined your neighborhood`;
    } 
    // For profile updates
    return `[[${actorName}]] updated their profile`;
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewNeighbor}
      onDismiss={onDismiss}
    >
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
