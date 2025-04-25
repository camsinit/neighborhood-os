/**
 * NotificationDrawer Component
 * 
 * This component provides a button in the UI that, when clicked,
 * opens a drawer from the right side of the screen containing the 
 * user's notifications.
 */
import React, { useState } from 'react';
import { Bell, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNotifications, archiveNotification } from "@/hooks/notifications";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";

/**
 * A drawer component for notifications that slides in from the right side
 * Replaces the previous popover component with a full drawer
 */
const NotificationDrawer = () => {
  // State to track whether to show archived notifications
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch notifications using our custom hook
  const { data: notifications, refetch, isLoading } = useNotifications(showArchived);
  
  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications?.some(n => !n.is_read && !n.is_archived);

  /**
   * Handle clicks on notification items
   * Navigates to the appropriate page and highlights the item
   */
  const handleItemClick = (
    type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors",
    id: string
  ) => {
    // Create a custom event to notify other components
    const event = new CustomEvent('openItemDialog', {
      detail: { type, id }
    });
    window.dispatchEvent(event);
    
    // Refresh the notifications after clicking
    refetch();
  };

  /**
   * Handle archiving a notification
   */
  const handleArchive = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
    refetch();
  };

  return (
    <Drawer>
      {/* The trigger button with notification indicator - redesigned to be more compact */}
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative hover:bg-gray-100 flex items-center gap-1.5 bg-white/80 border border-purple-200 hover:border-purple-300 h-9 px-3"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4 text-purple-500" />
          <span className="font-medium text-sm text-purple-700">Notifications</span>
          {/* Show a dot indicator if there are unread notifications */}
          {hasUnreadNotifications && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" 
                  aria-label="You have unread notifications" />
          )}
        </Button>
      </DrawerTrigger>
      
      {/* The drawer content - slides in from the right side */}
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <DrawerTitle>
              {showArchived ? "Archived Notifications" : "Notifications"}
            </DrawerTitle>
            
            {/* Button to toggle between active and archived */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-500"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="h-4 w-4" />
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
          </div>
        </DrawerHeader>
        
        {/* Scrollable area for notification list */}
        <ScrollArea className="h-[80vh] px-4 py-2">
          {isLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications?.length ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  type={notification.type}
                  itemId={notification.id}
                  isRead={notification.is_read}
                  isArchived={notification.is_archived}
                  onClose={() => refetch()}
                  onArchive={(e) => handleArchive(e, notification.id)}
                  onItemClick={handleItemClick}
                  context={notification.context}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-gray-500">
                {showArchived ? "No archived notifications" : "No new notifications"}
              </p>
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationDrawer;
