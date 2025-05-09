
import { NotificationItem } from "./items/NotificationItem";
import { useNotifications } from "@/hooks/notifications";
import { Button } from "@/components/ui/button";
import { BellRing, Check, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BaseNotification } from "@/hooks/notifications/types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface NotificationsSectionProps {
  onClose?: () => void;
  showArchived?: boolean;
}

/**
 * Groups notifications by time period (Today, Yesterday, This Week, Earlier)
 */
const groupNotificationsByDate = (notifications: BaseNotification[]) => {
  // Create groups
  const groups: {
    title: string;
    notifications: BaseNotification[];
  }[] = [
    { title: "Today", notifications: [] },
    { title: "Yesterday", notifications: [] },
    { title: "This Week", notifications: [] },
    { title: "Earlier", notifications: [] },
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

export function NotificationsSection({ onClose, showArchived = false }: NotificationsSectionProps) {
  const { data: notifications, isLoading } = useNotifications(showArchived);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sort notifications by relevance score (higher first), then by date (newer first)
  const sortedNotifications = notifications?.sort((a, b) => {
    // First sort by relevance score (higher first)
    const relevanceDiff = (b.relevance_score || 0) - (a.relevance_score || 0);
    if (relevanceDiff !== 0) return relevanceDiff;
    
    // Then by date (newer first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Group notifications by date
  const groupedNotifications = sortedNotifications ? 
    groupNotificationsByDate(sortedNotifications) : [];

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_archived', showArchived);

      if (error) throw error;

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Clock className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="p-8 text-center">
        <BellRing className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showArchived 
            ? "No archived notifications to show"
            : "When you receive notifications, they'll show up here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold">
          {showArchived ? "Archived Notifications" : "Recent Notifications"}
        </h3>
        {!showArchived && notifications.some(n => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={markAllAsRead}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {groupedNotifications.map((group) => (
        <div key={group.title} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 px-4">{group.title}</h4>
          <div className="space-y-2 px-4">
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={onClose}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
