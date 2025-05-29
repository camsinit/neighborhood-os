
/**
 * NeighborNotificationCard.tsx
 * 
 * Specialized notification card for new neighbor announcements.
 * Now with clean language highlighting neighbor names in purple.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCard from "./base/NotificationCard";
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
  
  // Handle viewing neighbor profile
  const handleViewNeighbor = async () => {
    // Navigate to the neighbors section
    navigate('/neighbors');

    // Then highlight this neighbor
    setTimeout(() => {
      highlightItem('neighbors', notification.content_id);
    }, 100);
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewNeighbor}
      onDismiss={onDismiss}
    />
  );
};

export default NeighborNotificationCard;
