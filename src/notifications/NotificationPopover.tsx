
/**
 * Notification Popover Component
 * 
 * Quick dropdown showing recent notifications
 */
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationBell } from './NotificationBell';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useNotificationActions } from './useNotifications';

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNotifications();
  const { markAllAsRead } = useNotificationActions();

  // Show only first 5 notifications in popover
  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationBell />
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {/* Content */}
        <ScrollArea className="h-80">
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Loading...
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  variant="popover"
                />
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        {notifications.length > 5 && (
          <div className="p-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setOpen(false)}
            >
              View All ({notifications.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
