
import React, { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Separator } from "@/components/ui/separator";
import { useNotificationsPopoverData } from "@/hooks/notifications/useNotificationsPopoverData";
import { Skeleton } from "@/components/ui/skeleton";
import { createLogger } from "@/utils/logger";

// Create a logger for the component
const logger = createLogger('NotificationsPopover');

export const NotificationsPopover = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use our enhanced hook with error handling
  const { 
    data: notifications, 
    isLoading, 
    isError, 
    error, 
    refreshNotifications, 
    hasErrors,
    errorCount
  } = useNotificationsPopoverData(showArchived);

  // Log errors for debugging
  React.useEffect(() => {
    if (isError && error) {
      logger.error("Error fetching notifications:", error);
    }
  }, [isError, error]);

  // Safe rendering - count only if data exists
  const notificationCount = notifications ? notifications.length : 0;
  
  // Filter out archived notifications
  const unreadCount = notifications 
    ? notifications.filter(notification => !notification.is_read).length 
    : 0;

  // Refresh notifications when opening the popover
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !hasErrors) {
      refreshNotifications();
    }
  };

  // Skeleton loader for the loading state
  const renderSkeletonLoader = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-2 p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="p-4 text-center">
      <p className="text-destructive font-medium mb-2">Unable to load notifications</p>
      <p className="text-sm text-muted-foreground mb-3">
        There was a problem loading your notifications.
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          logger.info("Manual refresh attempt after error");
          refreshNotifications();
        }}
      >
        Try Again
      </Button>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="p-4 text-center">
      <p className="text-muted-foreground">No notifications yet</p>
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-2 font-medium">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </div>
        <Separator />
        
        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            renderSkeletonLoader()
          ) : isError ? (
            renderErrorState()
          ) : notificationCount === 0 ? (
            renderEmptyState()
          ) : (
            notifications?.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onRead={refreshNotifications}
              />
            ))
          )}
        </div>
        
        {!isLoading && !isError && notificationCount > 0 && (
          <>
            <Separator />
            <div className="p-2 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Hide Archived" : "Show Archived"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={refreshNotifications}
              >
                Refresh
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
