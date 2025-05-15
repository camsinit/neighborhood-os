// Only update the highlightItem call
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { highlightItem } from "@/utils/highlight";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Trash } from "lucide-react";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { HighlightableItemType } from "@/utils/highlight/types";

interface BaseNotificationItemProps {
  notification: BaseNotification;
  onDismiss: () => void;
  className?: string;
  renderActions?: () => React.ReactNode;
}

const BaseNotificationItem = ({
  notification,
  onDismiss,
  className,
}: BaseNotificationItemProps) => {
  const navigate = useNavigate();
  
  const {
    id,
    title,
    description,
    is_read,
    is_archived,
    content_type,
    content_id,
    notification_type
  } = notification;
  
  const isDeleted = is_archived;
  
  const handleClick = () => {
    // Navigate to content if not archived
    if (!isDeleted && content_type && content_id) {
      const contentType = content_type as HighlightableItemType;
      highlightItem(contentType, content_id);
      navigate(`/${content_type}/${content_id}`);
      onDismiss();
    }
  };
  
  // Handle view action - fixed highlightItem call
  const handleViewAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_type, notification.id);
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    
    // Navigate to the content
    if (notification.content_type && notification.content_id) {
      const contentType = notification.content_type as HighlightableItemType;
      highlightItem(contentType, notification.content_id);
    }
    
    if (onDismiss) onDismiss();
  };
  
  const handleArchiveAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await archiveNotification(id);
      onDismiss();
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex py-3 px-4 border-b last:border-b-0 relative",
        isDeleted && "opacity-50",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        {description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAction}
            className="h-7 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveAction}
            className="h-7 text-xs"
          >
            <Trash className="h-3.5 w-3.5 mr-1" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaseNotificationItem;
