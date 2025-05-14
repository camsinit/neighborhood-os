
/**
 * NotificationsPopover.tsx
 * 
 * Enhanced notifications popover with modern design and specialized notification cards
 */
import { Archive, Bell } from "lucide-react";
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
export const NotificationPopover = ({ 
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
 * The main notifications popover. Now it's smart about querying the broadcast notification list,
 * but has no DB/data logic; that all lives in the custom hook!
 */
interface NotificationsPopoverMainProps {
  children?: ReactNode;
}

/**
 * Main notifications popover component
 * Now exported as both a named export AND the default export
 */
export const NotificationsPopover = ({ children }: NotificationsPopoverMainProps) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);

  // Use our simplified hook that leverages React Query's built-in polling
  const { 
    data: notifications, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useNotificationsPopoverData(showArchived);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.is_read && !n.is_archived).length || 0;

  // Function to archive all notifications with proper toast management
  const handleArchiveAll = async () => {
    if (!notifications?.length) {
      toast({
        description: "No notifications to archive",
      });
      return;
    }

    // Show loading toast (in shadcn/ui we can't update toasts by ID like in sonner)
    // So we show a loading toast first
    toast({
      title: "Archiving notifications",
      description: "Please wait...",
    });

    try {
      // Archive all notifications
      const promises = notifications
        .filter(n => !n.is_archived)
        .map(n => archiveNotification(n.id));
        
      await Promise.all(promises);
      
      // Show success toast (we can't update the previous toast, so we create a new one)
      toast({
        title: "Success",
        description: `Archived ${promises.length} notifications`,
      });
      
      // Refresh the notifications list
      refetch();
    } catch (error) {
      console.error("Failed to archive notifications:", error);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive notifications",
      });
    }
  };

  // Show error message if there's an error
  if (isError) {
    console.error("Error fetching notifications:", error);
  }

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
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowArchived(!showArchived)}
                className="text-xs"
              >
                {showArchived ? "Active" : "Read"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleArchiveAll}
                className="text-xs flex items-center gap-1"
                disabled={!notifications?.length}
              >
                <Archive className="h-3 w-3" />
                Archive All
              </Button>
            </div>
          </div>
          
          <TabsContent value="active" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ScrollArea className="h-[350px] px-2">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-pulse flex justify-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications?.length && !showArchived ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={() => refetch()}
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
                <div className="p-4 text-center">
                  <div className="animate-pulse flex justify-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications?.length && showArchived ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-2">
                    <NotificationCardFactory
                      notification={notification}
                      onDismiss={() => refetch()}
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
