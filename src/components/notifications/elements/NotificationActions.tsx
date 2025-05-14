
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Archive } from "lucide-react";
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";
import { type HighlightableItemType } from "@/utils/highlight";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

// Create logger for this component
const logger = createLogger('NotificationActions');

interface NotificationActionsProps {
  id: string;
  contentType?: HighlightableItemType;
  contentId: string;
  isRead: boolean;
  onDismiss?: () => void;
  triggerSwipeAnimation?: () => void;
  notificationType?: string; // Added to handle type-specific actions
}

/**
 * Actions for a notification (View, Archive)
 */
const NotificationActions: React.FC<NotificationActionsProps> = ({
  id,
  contentType,
  contentId,
  isRead,
  onDismiss,
  triggerSwipeAnimation,
  notificationType // Capture the notification type
}) => {
  const navigate = useNavigate();

  /**
   * Handler for the View button
   * Marks notification as read and navigates to the content
   */
  const handleView = async () => {
    try {
      // Mark as read if not already
      if (!isRead) {
        // FIX: Pass the notification ID directly, not the content type
        // The markAsRead function expects id as its parameter
        await markAsRead(id);
      }
      
      // Log navigation attempt for debugging
      logger.debug(`Handling view for notification, type: ${notificationType}, content: ${contentType}:${contentId}`);

      // For RSVP notifications, we need special handling
      if (notificationType === 'event' && contentId) {
        // For RSVP notifications, navigate to the event
        logger.debug(`Navigating to event: ${contentId}`);
        navigate(`/events/${contentId}`);
      }
      // For other content types, use the highlight utility or direct navigation
      else if (contentType && contentId) {
        try {
          // Use the highlight utility for known content types
          highlightItem(contentType, contentId);
        } catch (error) {
          // Fallback to direct navigation if highlighting fails
          logger.error(`Error highlighting item, using fallback navigation:`, error);
          navigate(`/${contentType}/${contentId}`);
        }
      }
      
      // Call onDismiss callback if provided
      if (onDismiss) onDismiss();
      
    } catch (error) {
      logger.error("Error handling notification view:", error);
      toast.error("Could not open notification content");
    }
  };

  /**
   * Handler for the Archive button
   * Archives the notification and triggers removal animation
   */
  const handleArchive = async () => {
    try {
      // Trigger the slide-out animation first
      if (triggerSwipeAnimation) {
        triggerSwipeAnimation();
      }
      
      // Archive after a delay to allow animation to play
      setTimeout(async () => {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      }, 300);
    } catch (error) {
      logger.error("Error archiving notification:", error);
      toast.error("Failed to archive notification");
    }
  };

  return (
    <div className="flex justify-end gap-2 p-2 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="h-8 text-xs text-blue-600 hover:bg-blue-50 px-3"
        data-testid="notification-view-button"
      >
        <Eye className="h-3.5 w-3.5 mr-1" />
        View
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleArchive}
        className="h-8 text-xs text-gray-600 hover:bg-gray-50 px-3"
        data-testid="notification-archive-button"
      >
        <Archive className="h-3.5 w-3.5 mr-1" />
        Archive
      </Button>
    </div>
  );
};

export default NotificationActions;
