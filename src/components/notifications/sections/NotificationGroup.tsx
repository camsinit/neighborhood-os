
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import { NotificationCardFactory } from '../cards/NotificationCardFactory';

export interface NotificationGroupProps {
  title: string;
  notifications: BaseNotification[];
  onClose?: () => void; // Added onClose prop as optional
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
          <NotificationCardFactory
            key={notification.id}
            notification={notification}
            onDismiss={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationGroup;
