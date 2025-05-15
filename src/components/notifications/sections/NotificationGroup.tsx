
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import { NotificationCardFactory } from '../cards/NotificationCardFactory';
import { sortNotificationsByDate } from '../utils/notificationGroupingUtils';

interface NotificationGroupProps {
  title: string;
  notifications: BaseNotification[];
}

/**
 * Component that displays a group of notifications under a common header
 */
const NotificationGroup: React.FC<NotificationGroupProps> = ({ title, notifications }) => {
  // Sort notifications by date before rendering
  const sortedNotifications = sortNotificationsByDate(notifications);
  
  return (
    <div className="space-y-2">
      <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
        {title}
      </div>
      <div className="divide-y">
        {sortedNotifications.map((notification) => (
          <NotificationCardFactory key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

export default NotificationGroup;
