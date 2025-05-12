
/**
 * NotificationCard.tsx
 * 
 * This is the base notification card component that all specialized notification
 * cards will extend. It provides the core layout and styling.
 */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseNotification, HighlightableItemType } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Archive } from "lucide-react";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";

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
        // Handle any notification type value safely
        await markAsRead(notification_type, id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to the content if content type is valid
    if (content_type && content_id) {
      try {
        // Safe type handling for any content type
        // We know the highlightItem function accepts string values per our updated type
        highlightItem(content_type, content_id);
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

  // Get the appropriate border color based on notification type
  const getBorderColor = () => {
    // Convert notification_type to a string to ensure it works with any value
    const notificationType = String(notification_type).toLowerCase();
    
    // Match known types or default to gray
    switch (notificationType) {
      case "event":
        return "border-l-blue-500";
      case "safety":
        return "border-l-red-500";
      case "skills":
        return "border-l-green-500";
      case "neighbors":
        return "border-l-purple-500";
      case "goods":
        return "border-l-amber-500";
      case "support":
        return "border-l-indigo-500";
      default:
        return "border-l-gray-500";
    }
  };
  
  return (
    <Card 
      className={cn(
        "transition-all duration-300 overflow-hidden mb-2", 
        "border-l-4", 
        getBorderColor(), 
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
      
      <div 
        className="flex items-start p-3 cursor-pointer gap-3" 
        onClick={handleCardClick}
      >
        {/* Avatar section */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarUrl || ''} alt={actorName} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        {/* Content section */}
        <div className="flex-1 space-y-1 pr-6">
          {/* Title with optional type label */}
          <div className="flex items-center gap-2">
            {showTypeLabel && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                {notification_type}
              </Badge>
            )}
            
            <p className={cn(
              "text-sm",
              isUnread ? "font-semibold" : "font-medium"
            )}>
              {title}
            </p>
          </div>
          
          {/* Child content */}
          {children}
        </div>
      </div>
      
      {/* Action buttons */}
      {showActions && !is_archived && (
        <div className="flex border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
          >
            <Archive className="h-3.5 w-3.5 mr-1" />
            Archive
          </Button>
        </div>
      )}
    </Card>
  );
};

export default NotificationCard;
