
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell } from 'lucide-react';
import { useNotificationsPopoverData } from '@/hooks/notifications/useNotificationsPopoverData';
import NotificationsList from './sections/NotificationsList';
import { markAllAsRead } from '@/utils/notifications/notificationService';
import { groupNotificationsByDate } from './utils/notificationGroupingUtils';
import NotificationsHeader from './sections/NotificationsHeader';
import NotificationGroup from './sections/NotificationGroup';
import { Badge } from "@/components/ui/badge";

const NotificationsPopover = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Use our centralized notification data hook
  const { data: notifications, isLoading, refetch } = useNotificationsPopoverData(false);
  
  // Filter for unread notifications
  const unreadNotifications = notifications?.filter(n => !n.is_read);
  const unreadCount = unreadNotifications?.length || 0;
  
  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications || []);
  
  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <NotificationsHeader 
              title="Notifications" 
              unreadCount={unreadCount} 
              onMarkAllRead={handleMarkAllAsRead}
            />
          </div>
          
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
          
          <div className="max-h-[400px] overflow-y-auto">
            <TabsContent value="all" className="p-0 m-0">
              {groupedNotifications.length > 0 ? (
                <div className="divide-y">
                  {groupedNotifications.map((group, index) => (
                    <NotificationGroup 
                      key={index} 
                      title={group.title} 
                      notifications={group.notifications} 
                    />
                  ))}
                </div>
              ) : (
                <NotificationsList notifications={notifications} isLoading={isLoading} />
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="p-0 m-0">
              <NotificationsList notifications={unreadNotifications} isLoading={isLoading} />
            </TabsContent>
          </div>
          
          <div className="p-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                // Code to navigate to notifications page would go here
                setOpen(false);
              }}
            >
              View All
            </Button>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
