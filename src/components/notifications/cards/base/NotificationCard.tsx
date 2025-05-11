
/**
 * NotificationCard.tsx
 * 
 * This is the base notification card component that all specialized notification
 * cards will extend. It provides the core layout and styling.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NotificationAvatar,
  NotificationContent,
  NotificationTimeStamp,
  NotificationActions
} from "../../elements";

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
  
  // Get notification type display name
  const typeName = notification_type_display || 
    notification_type.charAt(0).toUpperCase() + notification_type.slice(1);

  // Determine variant based on read status
  const isUnread = !is_read;

  // Handle click on the notification card
  const handleCardClick = () => {
    if (onAction) onAction();
  };

  // Parse the title that might contain highlighted content within [[ ]] markers
  // The title is expected to be in format: "ActorName is hosting [[Event Name]]"
  const renderFormattedTitle = () => {
    // If the title doesn't contain highlighting markers, return it as is
    if (!title || !title.includes("[[")) {
      return <span>{title}</span>;
    }

    // Split by the highlighting markers
    const parts = title.split(/\[\[|\]\]/);
    
    // Return the formatted parts - odd indices should be highlighted
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a part that was between [[ and ]] - highlight it
        return (
          <span 
            key={index} 
            className={cn(
              "font-medium px-0.5 rounded",
              notification_type === "event" && "text-blue-600",
              notification_type === "safety" && "text-red-600",
              notification_type === "skills" && "text-green-600",
              notification_type === "neighbors" && "text-purple-600",
              notification_type === "goods" && "text-amber-600",
              notification_type === "support" && "text-indigo-600",
            )}
          >
            {part}
          </span>
        );
      }
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 overflow-hidden mb-2 group relative", // Added relative positioning
        isUnread 
          ? "bg-white border-l-4 border-l-blue-500 shadow" 
          : "bg-gray-50 border-gray-100",
        className
      )}
    >
      {/* Type badge and timestamp now positioned absolutely in the top right corner */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {showTimestamp && (
          <NotificationTimeStamp
            date={created_at}
            isUnread={isUnread}
          />
        )}
        
        {showTypeLabel && (
          <Badge 
            variant={isUnread ? "default" : "outline"} 
            className="text-[10px] h-5"
          >
            {typeName}
          </Badge>
        )}
      </div>
      
      <div 
        className={cn(
          "flex items-start p-3 gap-3 cursor-pointer",
          isUnread ? "hover:bg-blue-50" : "hover:bg-gray-100"
        )}
        onClick={handleCardClick}
      >
        {/* Avatar section using our reusable component */}
        <NotificationAvatar
          url={avatarUrl}
          name={actorName}
          isUnread={isUnread}
          className="mt-0.5"
        />
        
        {/* Content section using our reusable component */}
        <NotificationContent
          title={title}
          isUnread={isUnread}
          formattedTitle={renderFormattedTitle()}
        >
          {/* Render child components for specialized notification content */}
          {children}
          
          {/* Status badges */}
          <div className="flex gap-1 flex-shrink-0 mt-2">
            {context?.actionRequired && (
              <Badge 
                variant="destructive"
                className="text-[10px] h-5"
              >
                Action needed
              </Badge>
            )}
          </div>
        </NotificationContent>
      </div>
      
      {/* Action buttons using our reusable component */}
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
