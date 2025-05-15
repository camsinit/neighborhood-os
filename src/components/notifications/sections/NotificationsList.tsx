
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import { NotificationCardFactory } from '../cards/NotificationCardFactory';
import { sortNotificationsByDate } from '../utils/notificationGroupingUtils';

interface NotificationsListProps {
  notifications: BaseNotification[] | undefined;
  isLoading: boolean;
}

const NotificationsList = ({ 
  notifications, 
  isLoading 
}: NotificationsListProps) => {
  const sortedNotifications = sortNotificationsByDate(notifications);
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
            <div className="rounded-full bg-gray-200 h-9 w-9" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sortedNotifications.map((notification) => (
        <NotificationCardFactory key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationsList;
