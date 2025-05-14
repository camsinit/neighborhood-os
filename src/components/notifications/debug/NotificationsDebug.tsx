
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
    <Card className="mb-4 bg-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">
          Notification Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Include the debug controls component */}
        <NotificationsDebugControls />
      </CardContent>
    </Card>
  );
};
