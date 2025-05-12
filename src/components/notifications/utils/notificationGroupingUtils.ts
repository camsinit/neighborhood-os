
/**
 * notificationGroupingUtils.ts
 * 
 * Utility functions for grouping notifications by date
 */
import { BaseNotification } from "@/hooks/notifications/types";
import { isToday, isYesterday, isThisWeek } from "date-fns";

/**
 * Interface for grouped notifications
 */
export interface NotificationGroup {
  title: string;
  notifications: BaseNotification[];
}

/**
 * Groups notifications by time period (Today, Yesterday, This Week, Earlier)
 * 
 * @param notifications - The array of notifications to group
 * @returns An array of groups with title and notifications
 */
export const groupNotificationsByDate = (notifications: BaseNotification[]): NotificationGroup[] => {
  // Create groups
  const groups: NotificationGroup[] = [
    {
      title: "Today",
      notifications: []
    }, 
    {
      title: "Yesterday",
      notifications: []
    }, 
    {
      title: "This Week",
      notifications: []
    }, 
    {
      title: "Earlier",
      notifications: []
    }
  ];

  // Sort notifications into groups
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    if (isToday(date)) {
      groups[0].notifications.push(notification);
    } else if (isYesterday(date)) {
      groups[1].notifications.push(notification);
    } else if (isThisWeek(date)) {
      groups[2].notifications.push(notification);
    } else {
      groups[3].notifications.push(notification);
    }
  });

  // Filter out empty groups
  return groups.filter(group => group.notifications.length > 0);
};

/**
 * Sort notifications by date (newer first)
 */
export const sortNotificationsByDate = (notifications: BaseNotification[] | undefined): BaseNotification[] => {
  if (!notifications) return [];
  
  return [...notifications].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
