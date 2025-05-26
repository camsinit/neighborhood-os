
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import { NotificationCardFactory } from '../cards/NotificationCardFactory';
import { sortNotificationsByDate } from '../utils/notificationGroupingUtils';
import CompactNotificationItem from '../items/CompactNotificationItem';
import NotificationDensityControl from '../controls/NotificationDensityControl';
import { useNotificationDensity } from '@/hooks/notifications/useNotificationDensity';

interface NotificationsListProps {
  notifications: BaseNotification[] | undefined;
  isLoading: boolean;
  showDensityControl?: boolean; // New prop to control density toggle visibility
}

const NotificationsList = ({ 
  notifications, 
  isLoading,
  showDensityControl = true 
}: NotificationsListProps) => {
  const { density, setDensity, isCompact } = useNotificationDensity();
  const sortedNotifications = sortNotificationsByDate(notifications);
  
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {/* Compact loading skeletons */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
            <div className="rounded-full bg-gray-200 h-7 w-7" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-8" />
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
    <div>
      {/* Density control header */}
      {showDensityControl && (
        <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-50">
          <span className="text-xs text-gray-600 font-medium">
            {sortedNotifications.length} notifications
          </span>
          <NotificationDensityControl 
            density={density} 
            onDensityChange={setDensity} 
          />
        </div>
      )}
      
      {/* Notifications list with density-based rendering */}
      <div className={isCompact ? "divide-y divide-gray-100" : "divide-y"}>
        {sortedNotifications.map((notification) => (
          <div key={notification.id}>
            {isCompact ? (
              <CompactNotificationItem 
                notification={notification} 
                onDismiss={() => {}} 
              />
            ) : (
              <div className="p-2">
                <NotificationCardFactory 
                  notification={notification} 
                  onDismiss={() => {}} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;
