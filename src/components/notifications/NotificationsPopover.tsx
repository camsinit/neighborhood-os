
/**
 * NotificationsPopover.tsx
 * 
 * Enhanced notifications popover with modern design and specialized notification cards
 * Now with automatic refresh functionality
 */
import { useEffect, useState, ReactNode } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationsPopoverData } from "./hooks/useNotificationsPopoverData";
import { highlightItem, type HighlightableItemType } from "@/utils/highlight";
import NotificationCardFactory from "./cards/NotificationCardFactory";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this component
const logger = createLogger('NotificationsPopover');

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
 * The main notifications popover
 */
interface NotificationsPopoverMainProps {
  children?: ReactNode;
}

/**
 * Main notifications popover component
 */
export const NotificationsPopover = ({ children }: NotificationsPopoverMainProps) => {
  const [showArchived, setShowArchived] = useState(false);

  // Use our enhanced hook to fetch notifications
  const { data: notifications, isLoading, error, refreshNotifications } = useNotificationsPopoverData(showArchived);

  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      logger.error("Error fetching notifications:", error);
    }
  }, [error]);

  // Set up automatic refresh interval (every 30 seconds)
  useEffect(() => {
    logger.debug("Setting up notifications refresh interval");
    
    const intervalId = setInterval(() => {
      logger.debug("Automatically refreshing notifications");
      refreshNotifications();
    }, 30000); // 30 seconds
    
    return () => {
      logger.debug("Clearing notifications refresh interval");
      clearInterval(intervalId);
    };
  }, [refreshNotifications]);

  // Also refresh when the component mounts
  useEffect(() => {
    logger.debug("Component mounted, refreshing notifications");
    refreshNotifications();
  }, [refreshNotifications]);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read && !n.is_archived).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Tabs defaultValue="active">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-semibold">
              Notifications
            </h4>
            <TabsList className="h-8">
              <TabsTrigger value="active" className="text-xs h-8">Active</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs h-8">Archived</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="active" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ScrollArea className="h-[350px] px-2">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications?.length && !showArchived ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={() => refreshNotifications()}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ScrollArea className="h-[350px] px-2">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading archived notifications...
                </div>
              ) : notifications?.length && showArchived ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={() => refreshNotifications()}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No archived notifications
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

// Add default export to fix the import error
export default NotificationsPopover;
