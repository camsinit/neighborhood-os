
/**
 * NeighborNotificationCard.tsx
 * 
 * Specialized notification card for new neighbor announcements.
 * Modified to work directly with database-generated notifications.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { highlightItem } from "@/utils/highlight";
import { useNavigate } from "react-router-dom";

interface NeighborNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NeighborNotificationCard: React.FC<NeighborNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Set up navigation to go to neighbors page
  const navigate = useNavigate();
  
  // Handle viewing neighbor profile - updated to use proper routing
  const handleViewNeighbor = async () => {
    // Navigate to the neighbors section
    navigate('/neighbors');

    // Then highlight this neighbor
    setTimeout(() => {
      highlightItem('neighbors', notification.content_id);
    }, 100);
    
    if (onDismiss) onDismiss();
  };

  // Extract actor name from the notification metadata or context
  const actorName = 
    notification.metadata?.neighborName || 
    notification.context?.neighborName || 
    notification.profiles?.display_name || 
    "A neighbor";
  
  // Create sentence-style title with highlighted neighbor name
  const createSentenceTitle = () => {
    // Action could be stored in metadata or context
    const action = 
      notification.metadata?.action || 
      notification.context?.action || 
      'join';
      
    // For join notifications, highlight the neighbor name
    if (action === "join") {
      return `[[${actorName}]] joined your neighborhood`;
    } 
    // For profile updates
    return `[[${actorName}]] updated their profile`;
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format if needed
  const notificationWithSentenceTitle = {
    ...notification,
    title: notification.title || sentenceTitle
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
