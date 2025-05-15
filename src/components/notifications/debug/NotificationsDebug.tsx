
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
  // Get notification data from the hook
  const {
    data: notifications,
    refetch,
    isLoading
  } = useNotifications(false);

  // Log notification data to console
  const logNotifications = () => {
    console.log("Current notifications:", notifications);
    toast.success("Notifications logged to console");
  };

  // Return the debug interface UI
  return (
    <Card className="mb-6 bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Notifications Debug</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 text-xs"
            onClick={logNotifications}
          >
            Log Notifications
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 text-xs"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
        <div className="text-xs text-slate-500">
          Count: {notifications?.length || 0} | 
          Unread: {notifications?.filter(n => !n.is_read).length || 0}
        </div>
        <NotificationsDebugControls />
      </CardContent>
    </Card>
  );
};

export default NotificationsDebug;
