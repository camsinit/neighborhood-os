
/**
 * NeighborNotificationCard.tsx
 * 
 * Specialized notification card for new neighbor announcements.
 * Now with improved highlighting behavior for seamless navigation.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { createLogger } from "@/utils/logger";

// Initialize logger
const logger = createLogger('NeighborNotificationCard');

interface NeighborNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NeighborNotificationCard: React.FC<NeighborNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Handle viewing neighbor profile with improved highlighting
  const handleViewNeighbor = () => {
    logger.debug("Viewing neighbor profile", { 
      contentId: notification.content_id,
      notificationType: notification.notification_type 
    });
    
    // Navigate to the neighbors section and highlight this neighbor
    // Pass true to show the toast notification when highlighting
    highlightItem('neighbor', notification.content_id, true);
    
    if (onDismiss) onDismiss();
  };

  // Extract actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with proper subject-verb-object structure
  const createSentenceTitle = () => {
    // For join notifications, put focus on the neighbor name
    if (notification.action_type === "join" || notification.context?.action === "join") {
      return `${actorName} joined your neighborhood`;
    } 
    // For profile updates
    return `${actorName} updated their profile`;
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
      {/* View profile button with improved styling */}
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs py-0 h-7 hover:bg-purple-50 hover:text-purple-700 transition-colors"
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
