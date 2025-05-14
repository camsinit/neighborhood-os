
/**
 * NotificationsPopover.tsx
 * 
 * Enhanced notifications popover with modern design and specialized notification cards
 */
import React, { ReactNode, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button"; // Added missing Button import
import { useNotificationsPopoverData } from "./hooks/useNotificationsPopoverData";
import { archiveNotification } from "@/hooks/notifications"; 
import { highlightItem, type HighlightableItemType } from "@/utils/highlight";
import NotificationPopoverTrigger from "./triggers/NotificationPopoverTrigger";
import NotificationsHeader from "./sections/NotificationsHeader";
import NotificationsList from "./sections/NotificationsList";

/**
 * Props for the popover component that shows notification content
 */
interface NotificationPopoverProps {
  children: ReactNode;
  title: string;
  type: string;
  itemId: string;
  onAction?: () => void;
  actionLabel?: string;
  isArchived?: boolean;
  // Navigation and highlighting props
  contentId?: string;
  contentType?: HighlightableItemType;
}

/**
 * Individual notification popover component - for use in skill notification items
 */
export const NotificationPopover = ({ 
  children, 
  title, 
  type, 
  itemId, 
  onAction, 
  actionLabel = "View",
  isArchived = false,
  contentId,
  contentType 
}: NotificationPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-500 mb-4">
          Click the button below to {actionLabel.toLowerCase()} this {type}.
        </div>
        <div className="flex justify-end">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Props for the main notifications popover
 */
interface NotificationsPopoverMainProps {
  children?: ReactNode;
}

/**
 * Main notifications popover component
 */
export const NotificationsPopover = ({ children }: NotificationsPopoverMainProps) => {
  // State for showing archived notifications
  const [showArchived, setShowArchived] = useState(false);

  // Use our simplified hook that leverages React Query's built-in polling
  const { 
    data: notifications, 
    isLoading, 
    refetch 
  } = useNotificationsPopoverData(showArchived);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read && !n.is_archived).length || 0;

  // Toggle between showing active and archived notifications
  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
  };

  // Function to archive all notifications without toast messages
  const handleArchiveAll = async () => {
    if (!notifications?.length) {
      return;
    }

    try {
      // Archive all notifications
      const promises = notifications
        .filter(n => !n.is_archived)
        .map(n => archiveNotification(n.id));
        
      await Promise.all(promises);
      
      // Refresh the notifications list
      refetch();
    } catch (error) {
      console.error("Failed to archive notifications:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || <NotificationPopoverTrigger unreadCount={unreadCount} />}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationsHeader 
          showArchived={showArchived}
          onToggleArchived={handleToggleArchived}
          onArchiveAll={handleArchiveAll}
          hasNotifications={!!notifications?.length}
        />
        
        <NotificationsList 
          notifications={notifications}
          isLoading={isLoading}
          showArchived={showArchived}
          onDismiss={() => refetch()}
        />
      </PopoverContent>
    </Popover>
  );
};

// Default export to fix the import error
export default NotificationsPopover;
