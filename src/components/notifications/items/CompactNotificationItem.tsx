
/**
 * CompactNotificationItem - Ultra space-efficient notification display
 * 
 * This component maximizes the number of notifications visible by using:
 * - Single-line layout with minimal padding
 * - Smaller avatars (28px instead of 40px)
 * - Inline timestamps and actions
 * - Hover states for additional controls
 */
import React, { useState } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";
import { HighlightableItemType } from "@/utils/highlight/types";
import { getNotificationBorderColor } from "../utils/notificationColorUtils";

interface CompactNotificationItemProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Helper function to get ultra-short timestamp format
 * Examples: "5m", "2h", "3d", "1w"
 */
const getUltraShortTime = (date: string): string => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now.getTime() - notificationDate.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${weeks}w`;
};

/**
 * Compact notification item with space-efficient design
 */
const CompactNotificationItem: React.FC<CompactNotificationItemProps> = ({
  notification,
  onDismiss
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Extract notification data
  const {
    id,
    title,
    created_at,
    is_read,
    content_id,
    content_type,
    notification_type
  } = notification;

  // Get actor info with fallbacks
  const actorName = notification.profiles?.display_name || notification.context?.neighborName || "A neighbor";
  const avatarUrl = notification.profiles?.avatar_url || notification.context?.avatarUrl;
  
  // Get border color for notification type
  const borderColorClass = getNotificationBorderColor(notification_type);
  
  // Create single-line summary with smart truncation
  const createSummary = () => {
    const action = notification.action_type === 'rsvp' ? 'RSVP\'d to' : 
                   notification.action_type === 'comment' ? 'commented on' :
                   notification.action_type === 'request' ? 'requested' :
                   notification.action_type === 'offer' ? 'offered' : 'updated';
    
    return `${actorName} ${action} ${title}`;
  };
  
  // Handle main click action (view/navigate)
  const handleClick = async () => {
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
        const contentTypeAsHighlightable = content_type as HighlightableItemType;
        highlightItem(contentTypeAsHighlightable, content_id);
      } catch (error) {
        console.error("Error navigating to content:", error);
        navigate(`/${content_type}/${content_id}`);
      }
    }
    
    if (onDismiss) onDismiss();
  };
  
  // Handle archive action
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await archiveNotification(id);
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };
  
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-l-2",
        !is_read && "bg-blue-50/30",
        borderColorClass
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Avatar - 28px */}
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xs">
          {actorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {/* Content with smart truncation */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm truncate",
          !is_read ? "font-medium text-gray-900" : "text-gray-700"
        )}>
          {createSummary()}
        </p>
      </div>
      
      {/* Ultra-short timestamp */}
      <span className="text-xs text-gray-400 flex-shrink-0">
        {getUltraShortTime(created_at)}
      </span>
      
      {/* Hover actions - only show archive button */}
      {isHovered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          className="h-6 w-6 p-0 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <Archive className="h-3 w-3" />
        </Button>
      )}
      
      {/* Unread indicator */}
      {!is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </div>
  );
};

export default CompactNotificationItem;
