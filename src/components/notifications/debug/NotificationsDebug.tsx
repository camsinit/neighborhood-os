
/**
 * Component for debugging notifications during development
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/notifications';
import { toast } from 'sonner';
import NotificationsDebugControls from './NotificationsDebugControls';
import { supabase } from "@/integrations/supabase/client";

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

  // Create a test notification
  const createTestNotification = async () => {
    try {
      // Get current user
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast.error("No authenticated user found");
        return;
      }
      
      // Create a test notification
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user.id,
          actor_id: data.user.id, // Self as actor for test
          title: 'Test Notification',
          content_type: 'test',
          content_id: crypto.randomUUID(), // Random ID
          notification_type: 'event', // Using event type for testing
          action_type: 'view',
          action_label: 'View Test',
          relevance_score: 3,
          metadata: { test: true, timestamp: new Date().toISOString() }
        })
        .select();
        
      if (error) {
        console.error("Error creating test notification:", error);
        toast.error("Failed to create test notification");
        return;
      }
      
      // Dispatch events to refresh notifications
      window.dispatchEvent(new CustomEvent('notification-created'));
      
      toast.success("Test notification created successfully");
      console.log("Created test notification:", notification);
      
    } catch (error) {
      console.error("Error in createTestNotification:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Return the debug interface UI
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Notifications Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={logNotifications} variant="outline">
            Log Notifications
          </Button>
          <Button onClick={createTestNotification} variant="outline">
            Create Test Notification
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            Refresh Notifications
          </Button>
        </div>
        <NotificationsDebugControls />
      </CardContent>
    </Card>
  );
};

export default NotificationsDebug;
