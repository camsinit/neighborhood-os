
/**
 * NotificationActions.tsx
 * 
 * A reusable component for notification action buttons
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Check, Eye } from "lucide-react";
import { markAsRead, archiveNotification } from "@/hooks/notifications/notificationActions";
import { useNavigate } from "react-router-dom";
import { navigateAndHighlight } from "@/utils/highlight";
import { HighlightableItemType } from "@/utils/highlight/types";
import { toast } from "react-toastify";
import { createLogger } from "@/utils/logger";

// Create a logger for this component
const logger = createLogger('NotificationActions');

interface NotificationActionsProps {
  id: string;
  contentType?: HighlightableItemType;
  contentId: string;
  isRead: boolean;
  notificationType?: string;
  onDismiss?: () => void;
  triggerSwipeAnimation?: () => void;
}

/**
 * Component for rendering a consistent set of notification action buttons
 * with minimal styling for better integration with parent components
 */
const NotificationActions: React.FC<NotificationActionsProps> = ({
  id,
  contentType,
  contentId,
  isRead,
  notificationType,
  onDismiss,
  triggerSwipeAnimation
}) => {
  // For navigation
  const navigate = useNavigate();
  
  // Handle viewing the notification content
  const handleView = async () => {
    try {
      // Mark as read if not already read
      if (!isRead) {
        await markAsRead(String(notificationType), id);
      }
      
      // Use the navigateAndHighlight utility for consistent navigation
      if (contentType) {
        navigateAndHighlight(contentType, contentId, navigate, true);
      }
      
      // Dismiss the notification from view if handler is provided
      if (onDismiss) onDismiss();
    } catch (error) {
      logger.error('Error handling view action:', error);
      toast.error('Could not process this notification');
    }
  };
  
  // Handle marking as read
  const handleMarkRead = async () => {
    try {
      await markAsRead(String(notificationType), id);
      
      // Trigger animation if provided
      if (triggerSwipeAnimation) {
        triggerSwipeAnimation();
      }
      
      // Dismiss after a delay to allow animation
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 300);
    } catch (error) {
      logger.error('Error marking as read:', error);
      toast.error('Could not mark notification as read');
    }
  };
  
  // Handle archiving
  const handleArchive = async () => {
    try {
      // Trigger animation if provided
      if (triggerSwipeAnimation) {
        triggerSwipeAnimation();
      }
      
      // Archive after a short delay to allow animation to complete
      setTimeout(async () => {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      }, 300);
    } catch (error) {
      logger.error('Error archiving notification:', error);
      toast.error('Could not archive notification');
    }
  };
  
  return (
    <div className="flex justify-end gap-1 px-4 pb-3">
      {/* Only show Mark as Read button if notification is unread */}
      {!isRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkRead}
          className="h-7 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Mark as Read
        </Button>
      )}
      
      {/* View button (only show if we have a content type to navigate to) */}
      {contentType && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          className="h-7 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
      )}
      
      {/* Archive button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleArchive}
        className="h-7 text-xs text-gray-600 hover:bg-gray-50"
      >
        <Archive className="h-3.5 w-3.5 mr-1" />
        Archive
      </Button>
    </div>
  );
};

export default NotificationActions;
