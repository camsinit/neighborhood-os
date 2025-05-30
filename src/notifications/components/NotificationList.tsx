
/**
 * Notification List Component
 * 
 * Handles rendering lists of notifications with virtualization support
 */
import React from 'react';
import { EnhancedNotification } from '../types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: EnhancedNotification[];
  onUpdate?: () => void;
  variant?: 'popover' | 'drawer' | 'page';
  emptyMessage?: string;
  loading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onUpdate,
  variant = 'drawer',
  emptyMessage = 'No notifications found',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${variant === 'popover' ? '2' : '3'}`}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onUpdate={onUpdate}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default NotificationList;
