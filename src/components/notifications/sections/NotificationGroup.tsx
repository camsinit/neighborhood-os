
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import NotificationItem from '../NotificationItem'; // Updated import

export interface NotificationGroupProps {
  title: string;
  notifications: BaseNotification[];
  onClose?: () => void;
}

const NotificationGroup: React.FC<NotificationGroupProps> = ({ 
  title, 
  notifications,
  onClose
}) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        {title}
      </h3>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onSelect={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationGroup;
