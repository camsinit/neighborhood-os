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
import { useToast } from "@/components/ui/use-toast";
import { BaseNotification } from "@/hooks/notifications/types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/notifications";
import NotificationCardFactory from "./cards/NotificationCardFactory";

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
  const { data: notifications, isLoading, refetch } = useNotifications(showArchived);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

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
      setIsMarkingRead(true);
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
      
      // Update safety_updates table
      const { error: safetyError } = await supabase.from("safety_updates" as const)
        .update({ is_read: true })
        .eq("author_id", userId)
        .eq("is_archived", showArchived);
        
      if (safetyError) {
        console.error("Error updating safety notifications:", safetyError);
      }
      
      // Update events table
      const { error: eventsError } = await supabase.from("events" as const)
        .update({ is_read: true })
        .eq("host_id", userId)
        .eq("is_archived", showArchived);
        
      if (eventsError) {
        console.error("Error updating event notifications:", eventsError);
      }
      
      // Update support_requests table
      const { error: supportError } = await supabase.from("support_requests" as const)
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_archived", showArchived);
        
      if (supportError) {
        console.error("Error updating support notifications:", supportError);
      }
      
      // Update goods_exchange table
      const { error: goodsError } = await supabase.from("goods_exchange" as const)
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_archived", showArchived);
        
      if (goodsError) {
        console.error("Error updating goods notifications:", goodsError);
      }
      
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetch();
      
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
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

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
      <div className={cn("flex items-center justify-between px-4 sticky top-0 bg-white z-10 py-2", 
        unreadCount > 0 ? "shadow-sm" : "")}>
        <div>
          <h3 className="text-lg font-semibold">
            {showArchived ? "Archived Notifications" : "Recent Notifications"}
          </h3>
          {!showArchived && unreadCount > 0 && (
            <p className="text-xs text-gray-500">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!showArchived && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={markAllAsRead}
            disabled={isMarkingRead}
          >
            {isMarkingRead ? (
              <Clock className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {groupedNotifications.map((group) => (
        <div key={group.title} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 px-4">{group.title}</h4>
          <div className="space-y-3 px-4">
            {group.notifications.map((notification) => (
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
