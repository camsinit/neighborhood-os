
/**
 * NotificationActions.tsx
 * 
 * A minimalist component for notification action buttons
 * with subtle styling and clear intent
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Eye, Archive } from "lucide-react"; 
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { useNavigate } from "react-router-dom";
import { navigateAndHighlight } from "@/utils/highlight/navigateAndHighlight";
import { type HighlightableItemType } from "@/utils/highlight";

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
 * with a clean, subtle design matching the reference image
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

  // Simple button styling to match the reference image
  return (
    <div className={cn("flex items-center justify-center gap-16 py-3 border-t border-gray-100", className)}>
      {/* View button with simplified design */}
      <button
        onClick={handleView}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Eye className="h-5 w-5 mr-2" />
        <span className="text-sm">View</span>
      </button>
      
      {/* Archive button with simplified design */}
      <button
        onClick={handleArchive}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Archive className="h-5 w-5 mr-2" />
        <span className="text-sm">Archive</span>
      </button>
    </div>
  );
};

export default NotificationActions;
