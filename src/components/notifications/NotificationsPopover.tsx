
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

const NotificationsPopover = ({ children }: NotificationsPopoverMainProps) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);

  const { data: notifications, refetch } = useNotificationsPopoverData(showArchived);

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
              {notifications?.length && !showArchived ? (
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
              {notifications?.length && showArchived ? (
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

export default NotificationsPopover;
