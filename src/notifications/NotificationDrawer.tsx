
/**
 * Notification Drawer Component
 * 
 * Full sidebar for notification management
 */
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useUnreadCount, useNotificationActions } from './useNotifications';

export function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { markAllAsRead } = useNotificationActions();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="lg" 
          className="relative flex items-center gap-2"
        >
          <Bell className="h-5 w-5" />
          <span className="hidden sm:inline">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications ({notifications.length})</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        {/* Content */}
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  variant="drawer"
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>When someone interacts with you, you'll receive notifications here.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
