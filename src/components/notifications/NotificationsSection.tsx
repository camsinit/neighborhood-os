
/**
 * NotificationsSection.tsx
 * 
 * Redesigned component that displays notifications in a clear, organized way.
 * Now refactored into smaller, more maintainable components.
 */
import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { NotificationsLoadingState, NotificationsEmptyState } from "./states/NotificationStates";
import NotificationGroup from "./sections/NotificationGroup";
import MarkAllAsReadButton from "./actions/MarkAllAsReadButton";
import { groupNotificationsByDate, sortNotificationsByDate } from "./utils/notificationGroupingUtils";

/**
 * Props for the NotificationsSection component
 * - onClose: Optional callback for when notification actions close the drawer
 * - showArchived: Whether to show archived notifications
 */
interface NotificationsSectionProps {
  onClose?: () => void;
  showArchived?: boolean;
}

/**
 * Main component for displaying notifications, organized by time
 */
export function NotificationsSection({
  onClose,
  showArchived = false
}: NotificationsSectionProps) {
  // Fetch notifications with our custom hook
  const {
    data: notifications,
    isLoading,
    refetch
  } = useNotifications(showArchived);
  
  // For invalidating cache
  const queryClient = useQueryClient();

  // Clear cache and refetch on component mount to ensure we have the latest formatting
  useEffect(() => {
    // Invalidate the notifications query cache to force a fresh fetch
    queryClient.invalidateQueries({
      queryKey: ["notifications"]
    });
    
    // Refetch after invalidating
    refetch();
    
    // Log for debugging purposes
    console.log("[NotificationsSection] Invalidated cache and refetched notifications");
  }, [queryClient, refetch]);

  // Sort notifications by date (newer first)
  const sortedNotifications = sortNotificationsByDate(notifications);

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(sortedNotifications);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  // Loading state
  if (isLoading) {
    return <NotificationsLoadingState />;
  }
  
  // No notifications state
  if (!notifications?.length) {
    return <NotificationsEmptyState showArchived={showArchived} />;
  }
  
  // Main content with notifications grouped by date
  return (
    <div className="space-y-4">
      {/* Mark all as read button */}
      <MarkAllAsReadButton 
        unreadCount={unreadCount} 
        showArchived={showArchived}
        onComplete={refetch}
      />
      
      {/* Render each date group */}
      {groupedNotifications.map(group => (
        <NotificationGroup
          key={group.title}
          title={group.title}
          notifications={group.notifications}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
