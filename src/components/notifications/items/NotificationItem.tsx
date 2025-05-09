
/**
 * Enhanced notification item component
 * 
 * This component handles the display of notification items with advanced features
 * like highlight navigation and custom styling
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { highlightItem } from "@/utils/highlight";
import BaseNotificationItem from "./BaseNotificationItem";
import { getNotificationStyle } from "../utils/notificationStyles";
import { HighlightableItemType } from "@/utils/highlight/types";

// Type mapping to convert notification types to highlightable item types
const notificationTypeToHighlightType: Record<string, HighlightableItemType> = {
  event: "event",
  safety: "safety",
  skills: "skills",
  goods: "goods",
  neighbors: "neighbors"
};

// Props for the NotificationItem component
interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

// Main notification item component
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect
}) => {
  const notificationType = notification.notification_type;
  const contentId = notification.content_id;
  const style = getNotificationStyle(notificationType);
  
  // Get the appropriate highlight type based on notification type
  const highlightType = notificationTypeToHighlightType[notificationType] || "event";
  
  // Handle clicking on a notification
  const handleItemClick = () => {
    // Navigate to and highlight the related content
    highlightItem(highlightType, contentId, true);
    
    // Call the onSelect callback if provided
    if (onSelect) onSelect();
  };
  
  // Build context object safely by checking if properties exist
  // This fixes the issue where profiles might not exist on the notification
  const context = {
    neighborName: notification.context?.neighborName || null,
    avatarUrl: notification.context?.avatarUrl || null
  };
  
  // If there's profile data available, use it
  if ('profiles' in notification) {
    // Use type assertion to access profiles since TypeScript doesn't know about it
    const profiles = (notification as any).profiles;
    if (profiles) {
      context.neighborName = profiles.display_name || context.neighborName;
      context.avatarUrl = profiles.avatar_url || context.avatarUrl;
    }
  }
  
  return (
    <BaseNotificationItem
      title={notification.title}
      type={highlightType}
      itemId={contentId}
      isRead={notification.is_read}
      isArchived={notification.is_archived || false}
      onClose={onSelect || (() => {})}
      onItemClick={handleItemClick}
      context={context}
    />
  );
};

// Export as default for compatibility with existing imports
export default NotificationItem;
