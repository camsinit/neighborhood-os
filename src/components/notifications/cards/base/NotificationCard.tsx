
/**
 * NotificationCard.tsx
 * 
 * This is the base notification card component that all specialized notification
 * cards will extend. It provides the core layout and styling.
 */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";
import { HighlightableItemType } from "@/utils/highlight/types";
import NotificationHeader from "./NotificationHeader";
import NotificationFooter from "./NotificationFooter";
import { getNotificationBorderColor } from "@/components/notifications/utils/notificationColorUtils";

// Props for all notification card variants
export interface NotificationCardProps {
  notification: BaseNotification;
  onAction?: () => void; // Callback for when primary action is triggered
  onDismiss?: () => void; // Callback for when card is dismissed
  className?: string;
  showActions?: boolean; // Whether to show action buttons
  showTimestamp?: boolean; // Whether to show timestamp
  showTypeLabel?: boolean; // Whether to show notification type label
  children?: React.ReactNode; // Children for the specialized content
}

/**
 * The base notification card component that handles common functionality
 * like display of actors, timestamps, and action buttons
 */
export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onAction,
  onDismiss,
  className,
  showActions = true,
  showTimestamp = true,
  showTypeLabel = false,
  children
}) => {
  // Add state for animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // For navigation to content
  const navigate = useNavigate();
  
  // Extract common notification properties
  const {
    id,
    title,
    created_at,
    is_read,
    is_archived,
    notification_type,
    content_id,
    content_type
  } = notification;

  // Actor info - could be from context or from profiles
  const actorName = notification.profiles?.display_name || "A neighbor";
  const avatarUrl = notification.profiles?.avatar_url;

  // Format timestamp for display
  const timestamp = format(new Date(created_at), 'MMM d, h:mm a');

  // Determine variant based on read status
  const isUnread = !is_read;

  // Handle click on the notification card
  const handleCardClick = () => {
    if (onAction) onAction();
  };
  
  // Handle view button click
  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Mark as read if not already
    if (!is_read) {
      try {
        // Convert notification_type to string to ensure type compatibility
        await markAsRead(String(notification_type), id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to the content if content type is valid
    if (content_type && content_id) {
      try {
        // Use type conversion to make TypeScript happy
        // This allows us to work with the dynamic notification types
        const contentTypeAsHighlightable = content_type as HighlightableItemType;
        highlightItem(contentTypeAsHighlightable, content_id);
      } catch (error) {
        console.error("Error navigating to content:", error);
        // Fallback navigation if highlighting fails
        navigate(`/${content_type}/${content_id}`);
      }
    }
    
    if (onDismiss) onDismiss();
  };
  
  // Handle archive button click
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger animation
    setIsAnimating(true);
    
    // Wait for animation to complete before performing action
    setTimeout(async () => {
      try {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      } catch (error) {
        console.error("Error archiving notification:", error);
      }
    }, 300);
  };

  // Get border color from utility function
  const borderColorClass = getNotificationBorderColor(notification_type);
  
  return (
    <Card 
      className={cn(
        "transition-all duration-300 overflow-hidden mb-2", 
        "border-l-4", 
        borderColorClass, 
        isUnread ? "bg-blue-50" : "bg-white",
        isAnimating && "transform translate-x-full opacity-0",
        className
      )}
    >
      {/* Timestamp in the top right corner */}
      {showTimestamp && (
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          {timestamp}
        </div>
      )}
      
      {/* Header section with avatar and title */}
      <NotificationHeader
        title={title}
        contentType={content_type}
        avatarUrl={avatarUrl}
        actorName={actorName}
        isUnread={isUnread}
        showTypeLabel={showTypeLabel}
        notificationType={notification_type}
        onClick={handleCardClick}
      />
      
      {/* Child content */}
      {children && (
        <div className="px-3 pb-3 -mt-1">
          {children}
        </div>
      )}
      
      {/* Footer with action buttons */}
      {showActions && (
        <NotificationFooter
          isArchived={is_archived}
          onView={handleView}
          onArchive={handleArchive}
        />
      )}
    </Card>
  );
};

export default NotificationCard;
