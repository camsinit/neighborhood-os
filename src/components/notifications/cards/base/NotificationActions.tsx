
/**
 * NotificationActions.tsx
 * 
 * This component handles the action buttons for notification cards,
 * like marking as read and archiving.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Check } from "lucide-react";
import { markAsRead, archiveNotification } from "@/hooks/notifications";

interface NotificationActionsProps {
  id: string;
  isRead: boolean;
  onDismiss?: () => void;
}

/**
 * Component for rendering notification action buttons
 */
const NotificationActions: React.FC<NotificationActionsProps> = ({
  id,
  isRead,
  onDismiss
}) => {
  // Handle marking as read
  const handleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRead) {
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

  return (
    <div className="flex border-t border-gray-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRead}
        className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
        disabled={isRead}
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
  );
};

export default NotificationActions;
