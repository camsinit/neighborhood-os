
/**
 * Component for debugging notifications during development
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/notifications';
import { toast } from 'sonner';
import NotificationsDebugControls from './NotificationsDebugControls';

/**
 * Debug component for notifications
 * Only displays in development mode
 */
export const NotificationsDebug = () => {
  const { data: notifications, refetch, isLoading } = useNotifications(false);
  
  // Log notification data to console
  const logNotifications = () => {
    console.log("Current notifications:", notifications);
    toast.success("Notifications logged to console");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notifications Debug Tools</h3>
      
      {/* Debug controls */}
      <NotificationsDebugControls />
      
      {/* Notification counts and data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notification Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p>Total notifications: {notifications?.length || 0}</p>
            <p>Unread: {notifications?.filter(n => !n.is_read).length || 0}</p>
            <p>Types: {Array.from(new Set(notifications?.map(n => n.notification_type) || [])).join(', ')}</p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={logNotifications}
            >
              Log to Console
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
