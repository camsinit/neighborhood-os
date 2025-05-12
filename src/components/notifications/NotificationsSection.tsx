
/**
 * NotificationsSection.tsx
 * 
 * Redesigned component that displays notifications in a clear, organized way.
 * Now using our new reusable components.
 */
import { Button } from "@/components/ui/button";
import { BellRing, Check, Clock, CircleDot } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseNotification } from "@/hooks/notifications/types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/notifications";
import NotificationCardFactory from "./cards/NotificationCardFactory";

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
 * Groups notifications by time period (Today, Yesterday, This Week, Earlier)
 * 
 * @param notifications - The array of notifications to group
 * @returns An array of groups with title and notifications
 */
const groupNotificationsByDate = (notifications: BaseNotification[]) => {
  // Create groups
  const groups: {
    title: string;
    notifications: BaseNotification[];
  }[] = [
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
  
  // For mark all as read functionality
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Sort notifications by date (newer first)
  const sortedNotifications = notifications?.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Group notifications by date
  const groupedNotifications = sortedNotifications 
    ? groupNotificationsByDate(sortedNotifications) 
    : [];

  /**
   * Function to mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Update all notification tables
      const tables = ["safety_updates", "events", "support_requests", "goods_exchange"];
      
      // Update each table in parallel
      await Promise.all(tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .update({ is_read: true })
          .eq("user_id", userId)
          .eq("is_archived", showArchived);
          
        if (error) {
          console.error(`Error updating ${table} notifications:`, error);
        }
      }));

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
      
      refetch();
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Clock className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }
  
  // No notifications state
  if (!notifications?.length) {
    return (
      <div className="p-8 text-center">
        <BellRing className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showArchived 
            ? "No archived notifications to show" 
            : "You'll receive notifications for activities that directly involve you"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {!showArchived && "For general neighborhood updates, check the activity feed"}
        </p>
      </div>
    );
  }
  
  // Main content with notifications grouped by date
  return (
    <div className="space-y-4">
      {/* Render each date group */}
      {groupedNotifications.map(group => (
        <div key={group.title} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 px-4">{group.title}</h4>
          <div className="space-y-3 px-4">
            {group.notifications.map(notification => (
              <NotificationCardFactory 
                key={notification.id} 
                notification={notification} 
                onDismiss={() => refetch()} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
