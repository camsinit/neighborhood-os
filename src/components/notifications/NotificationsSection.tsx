
/**
 * NotificationsSection.tsx
 * 
 * Redesigned component that displays notifications in a clear, organized way.
 * Now with enhanced debugging and layout animations.
 */
import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { NotificationsLoadingState, NotificationsEmptyState } from "./states/NotificationStates";
import NotificationGroup from "./sections/NotificationGroup";
import MarkAllAsReadButton from "./actions/MarkAllAsReadButton";
import { groupNotificationsByDate, sortNotificationsByDate } from "./utils/notificationGroupingUtils";
import { motion, AnimatePresence } from "framer-motion"; // Import for smooth layout animations
import { createLogger } from "@/utils/logger";

// Initialize logger for this component
const logger = createLogger('NotificationsSection');

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
    refetch,
    error
  } = useNotifications(showArchived);
  
  // For invalidating cache
  const queryClient = useQueryClient();

  // Clear cache and refetch on component mount to ensure we have the latest formatting
  useEffect(() => {
    // Log component mount
    logger.debug('NotificationsSection mounted', {
      showArchived,
      forceRefresh: true
    });
    
    // Invalidate the notifications query cache to force a fresh fetch
    queryClient.invalidateQueries({
      queryKey: ["notifications"]
    });
    
    // Refetch after invalidating
    refetch();
    
    // Log for debugging purposes
    logger.debug("Cache invalidated and refetch triggered");
  }, [queryClient, refetch, showArchived]);

  // Log when notifications data updates
  useEffect(() => {
    if (notifications) {
      logger.debug('Notifications data updated:', {
        count: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        types: notifications.map(n => n.notification_type)
      });
    }
    
    if (error) {
      logger.error('Error fetching notifications:', error);
    }
  }, [notifications, error]);

  // Sort notifications by date (newer first)
  const sortedNotifications = sortNotificationsByDate(notifications);

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(sortedNotifications);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  // Log the final state before render
  logger.debug('Rendering NotificationsSection', {
    isLoading,
    notificationsCount: notifications?.length || 0,
    groupedCount: groupedNotifications.length,
    unreadCount
  });
  
  // Loading state
  if (isLoading) {
    return <NotificationsLoadingState />;
  }
  
  // No notifications state
  if (!notifications?.length) {
    return <NotificationsEmptyState showArchived={showArchived} />;
  }
  
  // Main content with notifications grouped by date
  // We wrap everything in AnimatePresence and motion.div to enable smooth transitions
  return (
    <AnimatePresence>
      <motion.div 
        className="space-y-4"
        layout // This enables automatic layout adjustment
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}
