
/**
 * NotificationActions.tsx
 * 
 * A minimalist component for notification action buttons
 * with subtle styling and clear intent
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react"; 
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { cn } from "@/lib/utils";  
import { useNavigate } from "react-router-dom";
import { navigateAndHighlight } from "@/utils/highlight/navigateAndHighlight";
import { type HighlightableItemType } from "@/utils/highlight";
import { getNotificationTextColor } from "../utils/notificationColorUtils";

export interface NotificationActionsProps {
  id: string;
  contentId?: string;
  contentType?: HighlightableItemType;
  isRead: boolean;
  onDismiss?: () => void;
  className?: string;
  triggerSwipeAnimation?: () => void;
}

/**
 * Component for rendering minimalist notification action buttons
 */
const NotificationActions: React.FC<NotificationActionsProps> = ({
  id,
  contentId,
  contentType,
  isRead,
  onDismiss,
  className,
  triggerSwipeAnimation = () => {}
}) => {
  const navigate = useNavigate();
  
  // Handle viewing details (marks as read and navigates)
  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Mark as read when viewing
    if (!isRead) {
      try {
        await markAsRead("event", id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to content if we have content type and ID
    if (contentId && contentType) {
      // Navigate and highlight the relevant item
      navigateAndHighlight(contentType, contentId, navigate, true);
      
      // Dismiss after navigation is triggered
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 100);
    } else {
      if (onDismiss) onDismiss();
    }
  };

  // Handle archiving with animation
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger animation first
    triggerSwipeAnimation();
    
    // Archive after animation
    setTimeout(async () => {
      try {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      } catch (error) {
        console.error("Error archiving notification:", error);
      }
    }, 500);
  };

  // Get highlight color for buttons
  const highlightColor = getNotificationTextColor(contentType);
  const buttonHoverClass = highlightColor.replace('text-', 'hover:bg-').replace('-700', '-50');

  return (
    <div className={cn("flex justify-end gap-2 mt-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className={cn("h-8 text-xs text-gray-600 hover:bg-gray-50 px-3", buttonHoverClass)}
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
  );
};

export default NotificationActions;
