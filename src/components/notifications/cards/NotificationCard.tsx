
/**
 * NotificationCard.tsx
 * 
 * This is the base notification card component that all specialized notification
 * cards will extend. It provides the core layout and styling.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Archive, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BaseNotification } from "@/hooks/notifications/types";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { Card } from "@/components/ui/card";

// Props for all notification card variants
export interface NotificationCardProps {
  notification: BaseNotification;
  onAction?: () => void; // Callback for when primary action is triggered
  onDismiss?: () => void; // Callback for when card is dismissed
  className?: string;
  showActions?: boolean; // Whether to show action buttons
  showTimestamp?: boolean; // Whether to show timestamp
  showTypeLabel?: boolean; // Whether to show notification type label
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
  showTypeLabel = true,
}) => {
  // Extract common notification properties
  const {
    id,
    title,
    created_at,
    is_read,
    is_archived,
    notification_type,
    notification_type_display,
    context,
  } = notification;

  // Actor info - could be from context or from profiles
  const actorName = context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  const avatarUrl = context?.avatarUrl || 
    notification.profiles?.avatar_url || null;
  
  // Format the timestamp as relative time (e.g. "5 minutes ago")
  const formattedTime = formatDistanceToNow(new Date(created_at), { 
    addSuffix: true,
    includeSeconds: true 
  });

  // Handle marking as read
  const handleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!is_read) {
      try {
        // We'll use notification ID directly since our updated markAsRead function handles this
        await markAsRead("event", id);
        if (onDismiss) onDismiss();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  // Handle archiving
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveNotification(id);
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  // Get notification type display name
  const typeName = notification_type_display || 
    notification_type.charAt(0).toUpperCase() + notification_type.slice(1);

  // Determine variant based on read status
  const isUnread = !is_read;

  return (
    <Card 
      className={cn(
        "transition-all duration-200 overflow-hidden mb-2 group", 
        isUnread 
          ? "bg-white border-l-4 border-l-blue-500 shadow" 
          : "bg-gray-50 border-gray-100",
        className
      )}
    >
      <div 
        className={cn(
          "flex items-start p-3 gap-3 cursor-pointer",
          isUnread ? "hover:bg-blue-50" : "hover:bg-gray-100"
        )}
        onClick={() => {
          handleRead({} as React.MouseEvent);
          if (onAction) onAction();
        }}
      >
        {/* Avatar section */}
        <Avatar className="h-10 w-10 mt-0.5 flex-shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={actorName} />
          ) : (
            <AvatarFallback className={isUnread ? "bg-blue-100 text-blue-600" : "bg-gray-200"}>
              {actorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Content section */}
        <div className="flex-1 min-w-0">
          {/* Title and badge row */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm leading-tight mb-1",
              isUnread ? "font-medium text-gray-900" : "font-normal text-gray-700"
            )}>
              {title}
            </h4>
            
            {/* Status badges */}
            <div className="flex gap-1 flex-shrink-0">
              {showTypeLabel && (
                <Badge 
                  variant={isUnread ? "default" : "outline"} 
                  className="text-[10px] h-5 hidden sm:flex"
                >
                  {typeName}
                </Badge>
              )}
              
              {context?.actionRequired && (
                <Badge 
                  variant="destructive"
                  className="text-[10px] h-5"
                >
                  Action needed
                </Badge>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          {showTimestamp && (
            <p className={cn(
              "text-[11px]",
              isUnread ? "text-gray-700" : "text-gray-500"  
            )}>
              {formattedTime}
            </p>
          )}

          {/* Render any children notification components might provide */}
          {notification.context?.summary && (
            <p className="text-xs text-gray-600 mt-1">
              {notification.context.summary}
            </p>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {showActions && !is_archived && (
        <div className="flex border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRead}
            className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
            disabled={is_read}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Mark read
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
