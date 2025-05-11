
/**
 * NotificationActions.tsx
 * 
 * A reusable component for notification action buttons
 * like viewing details and archiving.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react"; 
import { markAsRead, archiveNotification } from "@/hooks/notifications";
import { cn } from "@/lib/utils";  
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { navigateAndHighlight } from "@/utils/highlight/navigateAndHighlight"; // Import our new utility
import { HighlightableItemType } from "@/utils/highlight"; // Import type for typechecking

export interface NotificationActionsProps {
  id: string;
  contentId?: string; // Add contentId prop for highlighting
  contentType?: HighlightableItemType; // Add content type prop
  isRead: boolean;
  onDismiss?: () => void;
  className?: string;
  // Add new prop for parent ref to apply animation
  triggerSwipeAnimation?: () => void;
}

/**
 * Component for rendering notification action buttons in a consistent style
 */
const NotificationActions: React.FC<NotificationActionsProps> = ({
  id,
  contentId, // New prop for content ID to highlight
  contentType, // New prop for content type
  isRead,
  onDismiss,
  className,
  // New prop with default noop function
  triggerSwipeAnimation = () => {}
}) => {
  // Get navigate function from react-router
  const navigate = useNavigate();
  
  // Handle viewing details (still marks as read in the background)
  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Still mark as read when viewing
    if (!isRead) {
      try {
        await markAsRead("event", id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // If we have content type and ID, navigate to it and highlight it
    if (contentId && contentType) {
      // Navigate and highlight the item
      navigateAndHighlight(contentType, contentId, navigate, true);
      
      // We call onDismiss after a short delay to ensure navigation happens
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 100);
    } else {
      // If we don't have content info, just dismiss
      if (onDismiss) onDismiss();
    }
  };

  // Handle archiving
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First trigger the animation
    triggerSwipeAnimation();
    
    // Wait for animation to finish before actual archiving
    setTimeout(async () => {
      try {
        await archiveNotification(id);
        if (onDismiss) onDismiss();
      } catch (error) {
        console.error("Error archiving notification:", error);
      }
    }, 500); // Match this timing with the CSS animation duration
  };

  return (
    <div className={cn("flex border-t border-gray-100", className)}>
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
  );
};

export default NotificationActions;
