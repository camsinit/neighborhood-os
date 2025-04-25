
import { Archive, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";
import { useToast } from "@/components/ui/use-toast";
import { useState, ReactNode } from "react";
import { useNotificationsPopoverData } from "./hooks/useNotificationsPopoverData";
import { archiveNotification } from "@/hooks/notifications"; // Add missing import

/**
 * The notification icon/popover. Now it's smart about querying the broadcast notification list,
 * but has no DB/data logic; that all lives in the custom hook!
 */
interface NotificationsPopoverProps {
  children?: ReactNode;
}

const NotificationsPopover = ({ children }: NotificationsPopoverProps) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);

  const { data: notifications, refetch } = useNotificationsPopoverData(showArchived);

  const handleItemClick = (type: any, id: string) => {
    const event = new CustomEvent('openItemDialog', {
      detail: { type, id }
    });
    window.dispatchEvent(event);

    if (type === 'event' || type === 'support') {
      toast({
        title: "Navigating to item",
        description: "The relevant section has been highlighted for you.",
        duration: 3000,
      });

      setTimeout(() => {
        const section = type === 'event' ? 
          document.querySelector('.calendar-container') : 
          document.querySelector('.mutual-support-container');
        
        if (section) {
          section.classList.add('highlight-section');
          setTimeout(() => {
            section.classList.remove('highlight-section');
          }, 2000);
        }

        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    refetch();
  };

  const handleArchive = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
    refetch();
  };

  const hasUnreadNotifications = notifications?.some(n => !n.is_read && !n.is_archived);

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
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">
            {showArchived ? "Archived Notifications" : "Notifications"}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-500"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-1" />
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications?.length ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                title={notification.title}
                itemId={notification.id}
                type={notification.type}
                isRead={notification.is_read}
                isArchived={notification.is_archived}
                context={notification.context}
                onClose={() => refetch()}
                onArchive={(e) => handleArchive(e, notification.id)}
                onItemClick={handleItemClick}
              />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {showArchived ? "No archived notifications" : "No new notifications"}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
