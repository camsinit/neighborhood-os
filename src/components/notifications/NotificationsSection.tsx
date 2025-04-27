import { NotificationItem } from "./items/NotificationItem";
import { useNotifications } from "@/hooks/notifications";
import { Button } from "@/components/ui/button";
import { BellRing, Check } from "lucide-react";

interface NotificationsSectionProps {
  onClose?: () => void;
  showArchived?: boolean;
}

export function NotificationsSection({ onClose, showArchived = false }: NotificationsSectionProps) {
  const { data: notifications, isLoading } = useNotifications(showArchived);

  const sortedNotifications = notifications?.sort((a, b) => {
    // First sort by relevance score (higher first)
    const relevanceDiff = (b.relevance_score || 0) - (a.relevance_score || 0);
    if (relevanceDiff !== 0) return relevanceDiff;
    
    // Then by date (newer first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;
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
            onClick={() => {/* Implement mark all as read */}}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>
      <div className="space-y-2 px-4">
        {sortedNotifications?.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onSelect={() => {/* Implement notification action */}}
          />
        ))}
      </div>
    </div>
  );
}
