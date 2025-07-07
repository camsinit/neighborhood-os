/**
 * NotificationsList Component
 * 
 * A contained panel version of notifications for embedded use
 * Maintains all functionality from NotificationDrawer: swipe dismissal, card design, etc.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useUnreadCount, useNotificationActions } from './useNotifications';

export function NotificationsList() {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications ({notifications.length})
            {unreadCount > 0 && (
              <span className="h-5 w-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </h2>
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
      </div>
      
      {/* Content - maintains exact same functionality and design */}
      <ScrollArea className="flex-1">
        <div>
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
              <p>No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll see updates from your neighborhood here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}