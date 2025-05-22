
/**
 * NotificationCard.tsx
 * 
 * Base notification card with space-efficient design and clean language
 */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";
import { HighlightableItemType } from "@/utils/highlight/types";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";
import NotificationAvatar from "../../elements/NotificationAvatar";
import NotificationContent from "../../elements/NotificationContent";
import NotificationTimeStamp from "../../elements/NotificationTimeStamp";
import { getNotificationBorderColor } from "../../utils/notificationColorUtils";

// Props for all notification card variants
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
 * The base notification card with space-efficient design
 * Now streamlined for better use of space and cleaner presentation
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

  // Actor info with fallbacks
  const actorName = notification.profiles?.display_name || notification.context?.neighborName || "A neighbor";
  const avatarUrl = notification.profiles?.avatar_url || notification.context?.avatarUrl;

  // Get the border color based on notification type
  const borderColorClass = getNotificationBorderColor(notification_type);

  // Handle card click
  const handleCardClick = () => {
    if (onAction) onAction();
  };
  
  // Handle view button click
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
    
    // Navigate to content
    if (content_type && content_id) {
      try {
        // Using the highlightItem utility
        const contentTypeAsHighlightable = content_type as HighlightableItemType;
        highlightItem(contentTypeAsHighlightable, content_id);
      } catch (error) {
        console.error("Error navigating to content:", error);
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
        "transition-all duration-300 overflow-hidden mb-1.5 relative border-l-4", // Reduced margin-bottom
        isAnimating && "transform translate-x-full opacity-0",
        borderColorClass,
        !is_read && "bg-gray-50",
        className
      )}
    >
      {/* More compact layout with less padding */}
      <div className="p-2" onClick={handleCardClick}> {/* Reduced padding for better space usage */}
        {/* Timestamp in corner for better space usage */}
        {showTimestamp && (
          <NotificationTimeStamp 
            date={created_at} 
            isUnread={!is_read} 
            position="corner"
            className="absolute top-1.5 right-1.5 text-[10px]" // Made smaller and positioned tighter
          />
        )}
      
        <div className="flex gap-1.5 items-start"> {/* Reduced gap between elements */}
          {/* Smaller avatar */}
          <NotificationAvatar
            url={avatarUrl}
            name={actorName}
            isUnread={!is_read}
            notificationType={notification_type}
            size="sm" // Using small size by default
          />
          
          {/* Content area with simple language */}
          <div className="flex-1 min-w-0 pr-5"> {/* Right padding for timestamp */}
            <NotificationContent 
              title={title}
              actorName={actorName}
              contentType={content_type || notification_type}
              isUnread={!is_read}
            />
            
            {/* Optional custom content (badges, etc.) */}
            {children && (
              <div className="mt-0.5"> {/* Reduced margin */}
                {children}
              </div>
            )}
            
            {/* Compact action buttons */}
            {showActions && (
              <div className="flex justify-end gap-1 mt-1.5 pt-1 border-t border-gray-100"> {/* Tighter spacing */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  className="h-6 text-xs text-gray-600 hover:bg-gray-50 px-1.5" // Smaller button
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchive}
                  className="h-6 text-xs text-gray-600 hover:bg-gray-50 px-1.5" // Smaller button
                >
                  <Archive className="h-3 w-3 mr-1" />
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
