
/**
 * NotificationCard.tsx
 * 
 * Base notification card with minimalist design principles.
 * 
 * Component Responsibility:
 * - Renders the core notification UI structure
 * - Handles common notification interactions (view, archive)
 * - Provides consistent styling and animation
 * - Allows specialized content via children prop
 * 
 * Notification Flow:
 * 1. Card receives notification data from parent
 * 2. Card handles click events and navigation
 * 3. Card triggers read/archive actions when appropriate
 * 4. Card emits events for parent components via callbacks
 */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import { markAsRead, archiveNotification } from "@/hooks/notifications"; 
import { useNavigate } from "react-router-dom";
import { navigateAndHighlight } from "@/utils/highlight";
import { HighlightableItemType } from "@/utils/highlight/types";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";
import NotificationAvatar from "../../elements/NotificationAvatar";
import NotificationContent from "../../elements/NotificationContent";
import NotificationTimeStamp from "../../elements/NotificationTimeStamp";

/**
 * Props for all notification card variants
 * 
 * @property {BaseNotification} notification - The notification data to display
 * @property {() => void} onAction - Optional callback for when the card is clicked
 * @property {() => void} onDismiss - Optional callback for when notification is dismissed
 * @property {string} className - Optional additional CSS classes
 * @property {boolean} showActions - Whether to show action buttons
 * @property {boolean} showTimestamp - Whether to show the timestamp
 * @property {React.ReactNode} children - Optional additional content
 */
export interface NotificationCardProps {
  notification: BaseNotification;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  showActions?: boolean;
  showTimestamp?: boolean;
  children?: React.ReactNode;
}

/**
 * The base notification card with minimalist design
 * 
 * This component provides the foundation for all notification cards.
 * It handles common functionality like marking as read and archiving,
 * while allowing specialized content via children.
 * 
 * @param props - Component props (see NotificationCardProps)
 * @returns A Card component with notification content
 */
export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onAction,
  onDismiss,
  className,
  showActions = true,
  showTimestamp = true,
  children
}) => {
  // Add state for animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // For navigation to content
  const navigate = useNavigate();
  
  // Extract properties
  const {
    id,
    title,
    created_at,
    is_read,
    content_id,
    content_type,
    notification_type
  } = notification;

  // Actor info with fallbacks for missing data
  const actorName = notification.profiles?.display_name || notification.context?.neighborName || "A neighbor";
  const avatarUrl = notification.profiles?.avatar_url || notification.context?.avatarUrl;

  /**
   * Handle card click
   * Triggers the onAction callback if provided
   */
  const handleCardClick = () => {
    if (onAction) onAction();
  };
  
  /**
   * Handle view button click
   * Marks notification as read and navigates to the related content
   * 
   * @param e - Click event
   */
  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Mark as read if not already
    if (!is_read) {
      try {
        await markAsRead(String(notification_type), id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to content using the unified navigateAndHighlight function
    if (content_type && content_id) {
      navigateAndHighlight(
        content_type as HighlightableItemType,
        content_id,
        navigate,
        true
      );
    }
    
    if (onDismiss) onDismiss();
  };
  
  /**
   * Handle archive button click
   * Animates the card away and then archives the notification
   * 
   * @param e - Click event
   */
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger animation
    setIsAnimating(true);
    
    // Archive after animation
    setTimeout(async () => {
      try {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      } catch (error) {
        console.error("Error archiving notification:", error);
      }
    }, 300);
  };
  
  return (
    <Card 
      className={cn(
        "transition-all duration-300 overflow-hidden mb-3 relative", 
        isAnimating && "transform translate-x-full opacity-0",
        className
      )}
    >
      {/* Timestamp in top right */}
      {showTimestamp && (
        <NotificationTimeStamp 
          date={created_at} 
          isUnread={!is_read} 
          position="corner"
        />
      )}
      
      {/* Content area */}
      <div className="p-4" onClick={handleCardClick}>
        <div className="flex gap-3 items-start">
          {/* Avatar */}
          <NotificationAvatar
            url={avatarUrl}
            name={actorName}
            isUnread={!is_read}
            notificationType={notification.notification_type}
          />
          
          {/* Content area */}
          <div className="flex-1 min-w-0">
            <NotificationContent 
              title={title}
              actorName={actorName}
              contentType={content_type}
              isUnread={!is_read}
            >
              {children}
            </NotificationContent>
            
            {/* Action buttons */}
            {showActions && (
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  className="h-8 text-xs text-gray-600 hover:bg-gray-50 px-3"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchive}
                  className="h-8 text-xs text-gray-600 hover:bg-gray-50 px-3"
                >
                  <Archive className="h-3.5 w-3.5 mr-1" />
                  Archive
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;
