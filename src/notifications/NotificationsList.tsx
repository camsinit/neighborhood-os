
/**
 * NotificationsList Component
 * 
 * A contained panel version of notifications for embedded use
 * Maintains all functionality from NotificationDrawer: swipe dismissal, card design, etc.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, ChevronDown, Archive } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useUnreadCount, useNotificationActions, useArchivedNotifications } from './useNotifications';
import { groupByTimeInterval, getNonEmptyTimeGroups } from '@/utils/timeGrouping';

export function NotificationsList() {
  // State for controlling archive view
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: archivedNotifications = [], isLoading: isLoadingArchived, refetch: refetchArchived } = useArchivedNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { markAllAsRead } = useNotificationActions();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleViewArchive = async () => {
    setShowArchived(true);
    await refetchArchived();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Personal Notifications
            {unreadCount > 0 && (
              <div className="relative">
                <div className="h-6 w-6 bg-red-500 rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
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
      
      {/* Content - maintains exact same functionality and design with time grouping */}
      <ScrollArea className="flex-1">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          {(isLoading || (showArchived && isLoadingArchived)) ? (
            <div className="text-center py-8 text-gray-500">
              Loading notifications...
            </div>
          ) : (() => {
            // Use archived notifications if showing archive, otherwise use regular notifications
            const displayNotifications = showArchived ? archivedNotifications : notifications;
            
            if (displayNotifications.length > 0) {
              // Group notifications by time intervals
              const groupedNotifications = groupByTimeInterval(displayNotifications);
              const timeGroups = getNonEmptyTimeGroups(groupedNotifications);
              
              return (
                <>
                  {/* Show archive header if viewing archived notifications */}
                  {showArchived && (
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-700">Archived Notifications</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Showing {archivedNotifications.length} archived notification{archivedNotifications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  
                  {timeGroups.map(([interval, items], groupIndex) => (
                    <div key={interval}>
                      {/* Time interval section header */}
                      <h3 className={`text-sm font-medium text-gray-500 mb-2 ${groupIndex === 0 ? 'mt-0' : 'mt-6'}`}>
                        {interval}
                      </h3>
                      
                      {/* Notifications in this time group */}
                      <div className="mb-2">
                        {items.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            variant="drawer"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              );
            } else {
              return (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{showArchived ? 'No archived notifications' : 'No new notifications'}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {showArchived 
                      ? 'You haven\'t archived any notifications'
                      : 'Share a quick action above to create some neighborhood activity and notifications!'
                    }
                  </p>
                </div>
              );
            }
          })()}
          
          {/* View Archive button - only show if not viewing archive and there are current notifications */}
          {!showArchived && notifications.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleViewArchive}
                className="w-full max-w-[200px]"
              >
                <Archive className="h-4 w-4 mr-2" />
                View Archive
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
