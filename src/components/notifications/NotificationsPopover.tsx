
/**
 * NotificationsPopover.tsx
 * 
 * Enhanced notifications popover with modern design and specialized notification cards
 */
import { Archive, Bell, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useState, ReactNode } from "react";
import { useNotificationsPopoverData } from "./hooks/useNotificationsPopoverData";
import { archiveNotification } from "@/hooks/notifications"; 
import { highlightItem, type HighlightableItemType } from "@/utils/highlight";
import NotificationCardFactory from "./cards/NotificationCardFactory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationsEmptyState, NotificationsLoadingState } from "./states/NotificationStates";

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
  // New props for navigation and highlighting
  contentId?: string;
  contentType?: HighlightableItemType;
}

/**
 * Individual notification popover component - for use in skill notification items
 */
export const NotificationsPopover = ({ 
  children, 
  title, 
  type, 
  itemId, 
  onAction, 
  actionLabel = "View",
  isArchived = false,
  // New props with default values
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
 * Error state that appears when notifications fail to load
 */
const NotificationsErrorState = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="p-8 text-center">
      <div className="text-red-500 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          className="mx-auto mb-2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Unable to load notifications</h3>
      <p className="mt-1 text-xs text-gray-500 mb-4">
        There was a problem loading your notifications
      </p>
      <Button onClick={onRetry} size="sm" variant="outline" className="mx-auto">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
};

/**
 * Main notifications popover component
 */
const NotificationsPopoverComponent = ({ children }: { children?: ReactNode }) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);

  // Use our enhanced hook with error handling
  const { 
    data: notifications, 
    isLoading,
    isError, // Use standard ReactQuery properties instead
    error,
    refreshNotifications 
  } = useNotificationsPopoverData(showArchived);

  // Calculate unread count - protect against undefined
  const unreadCount = notifications?.filter(n => !n.is_read && !n.is_archived).length || 0;

  // Handle retry logic
  const handleRetry = () => {
    refreshNotifications();
    toast({ 
      title: "Retrying", 
      description: "Attempting to load notifications again..." 
    });
  };

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
              {/* Handle loading state */}
              {isLoading && !notifications && (
                <NotificationsLoadingState />
              )}
              
              {/* Handle error state */}
              {isError && (
                <NotificationsErrorState onRetry={handleRetry} />
              )}
              
              {/* Show notifications if available */}
              {notifications?.length && !showArchived && !isError ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={refreshNotifications}
                    />
                  </div>
                ))
              ) : (
                // Show empty state if no notifications or archived view is empty
                !isLoading && !isError && (
                  <NotificationsEmptyState showArchived={showArchived} />
                )
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ScrollArea className="h-[350px] px-2">
              {/* Handle loading state */}
              {isLoading && !notifications && (
                <NotificationsLoadingState />
              )}
              
              {/* Handle error state */}
              {isError && (
                <NotificationsErrorState onRetry={handleRetry} />
              )}
              
              {/* Show archived notifications if available */}
              {notifications?.length && showArchived && !isError ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={refreshNotifications}
                    />
                  </div>
                ))
              ) : (
                // Show empty state if no archived notifications
                !isLoading && !isError && (
                  <NotificationsEmptyState showArchived={showArchived} />
                )
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

// Export both components
export default NotificationsPopoverComponent;
