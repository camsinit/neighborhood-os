
/**
 * NotificationCard.tsx
 * 
 * This is the base notification card component that all specialized notification
 * cards will extend. It provides the core layout and styling.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BaseNotification } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import NotificationActions from "./NotificationActions";

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
  showTypeLabel = true,
  children,
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

  // Get notification type display name
  const typeName = notification_type_display || 
    notification_type.charAt(0).toUpperCase() + notification_type.slice(1);

  // Determine variant based on read status
  const isUnread = !is_read;

  // Handle click on the notification card
  const handleCardClick = () => {
    if (onAction) onAction();
  };

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
        onClick={handleCardClick}
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

          {/* Render child components for specialized notification content */}
          {children}
        </div>
      </div>
      
      {/* Action buttons */}
      {showActions && !is_archived && (
        <NotificationActions 
          id={id} 
          isRead={is_read} 
          onDismiss={onDismiss}
        />
      )}
    </Card>
  );
};

export default NotificationCard;
