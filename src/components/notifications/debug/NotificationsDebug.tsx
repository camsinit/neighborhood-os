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
  return;
};