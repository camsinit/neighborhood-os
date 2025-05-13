
/**
 * NotificationCard.tsx
 * 
 * Base notification card with minimalist design principles
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
 * The base notification card with minimalist design
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
    content_type
  } = notification;

  // Actor info with fallbacks for missing data
  const actorName = notification.profiles?.display_name || notification.context?.neighborName || "A neighbor";
  const avatarUrl = notification.profiles?.avatar_url || notification.context?.avatarUrl;

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
        await markAsRead(String(notification.notification_type), id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to content
    if (content_type && content_id) {
      try {
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
