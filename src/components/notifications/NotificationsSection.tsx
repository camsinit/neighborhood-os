
/**
 * NotificationsSection.tsx
 * 
 * Enhanced notifications section with better loading and error states
 */
import { useNotificationsPopoverData } from "@/hooks/notifications/useNotificationsPopoverData";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { BaseNotification } from "@/hooks/notifications";
import NotificationItem from "./items/NotificationItem";
import NotificationGroup from "./sections/NotificationGroup";
import { createLogger } from "@/utils/logger";
import { groupNotificationsByDate } from "./utils/notificationGroupingUtils";

// Create a logger for this component
const logger = createLogger('NotificationsSection');

// Props for the NotificationsSection component
interface NotificationsSectionProps {
  onClose?: () => void;
  showArchived: boolean;
}

/**
 * Component that displays notifications grouped by date
 */
export function NotificationsSection({ onClose, showArchived }: NotificationsSectionProps) {
  // Use our enhanced hook for notifications with polling and event handling
  const { 
    data: notifications, 
    isLoading, 
    error, 
    refreshNotifications,
    lastRefreshed
  } = useNotificationsPopoverData(showArchived, 15000); // Poll every 15 seconds
  
  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications || []);
  
  // Log component render for debugging
  logger.debug(`Rendering NotificationsSection: ${notifications?.length || 0} notifications, isLoading=${isLoading}, showArchived=${showArchived}`);
  
  // Show loading state while fetching
  if (isLoading && !notifications) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <span>Loading notifications...</span>
          <Skeleton className="h-4 w-16" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-500">Failed to load notifications</p>
        <Button onClick={refreshNotifications} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }
  
  // Show empty state if there are no notifications
  if (!notifications?.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">
          {showArchived ? 'No archived notifications' : 'No new notifications'}
        </p>
      </div>
    );
  }
  
  // Show notifications grouped by date
  return (
    <div className="py-2 space-y-6">
      {Object.entries(groupedNotifications).map(([date, notifs]) => (
        <NotificationGroup 
          key={date} 
          title={date} 
          notifications={notifs} 
          onClose={onClose}
        />
      ))}
      
      {/* Show refreshed timestamp at the bottom */}
      <div className="px-4 py-2 text-xs text-gray-400 text-center border-t">
        Last updated: {lastRefreshed.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default NotificationsSection;
