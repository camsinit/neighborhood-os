
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';
import refreshEvents from '@/utils/refreshEvents';
import { NotificationsDebugControls } from './NotificationsDebugControls';

const logger = createLogger('NotificationsDebug');

/**
 * Debug component for notifications
 * Only shown in development mode
 */
export const NotificationsDebug: React.FC = () => {
  const createTestNotification = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        toast.error("No authenticated user found");
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.user.id,
          title: `Test notification ${new Date().toLocaleTimeString()}`,
          content_type: 'test',
          content_id: crypto.randomUUID(),
          notification_type: 'event',
          relevance_score: 2
        })
        .select('id')
        .single();
      
      if (error) {
        toast.error("Failed to create test notification");
        console.error("Error creating test notification:", error);
        return;
      }
      
      toast.success(`Test notification created: ${data.id}`);
      
      // Trigger refresh events
      refreshEvents.notifications();
      
      // Also dispatch a DOM event for good measure
      window.dispatchEvent(new CustomEvent('notifications-created'));
      
    } catch (error) {
      console.error("Error in createTestNotification:", error);
      toast.error("An unexpected error occurred");
    }
  };
  
  const clearNotifications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        toast.error("No authenticated user found");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.user.id)
        .eq('content_type', 'test');
      
      if (error) {
        toast.error("Failed to clear test notifications");
        console.error("Error clearing test notifications:", error);
        return;
      }
      
      toast.success("All test notifications cleared");
      
      // Trigger refresh
      refreshEvents.notifications();
      
    } catch (error) {
      console.error("Error in clearNotifications:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-300">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium text-yellow-800">
          🔧 Notifications Debug (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={createTestNotification}
          className="bg-white text-xs h-8"
        >
          Create Test Notification
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={clearNotifications}
          className="bg-white text-xs h-8 border-red-300 hover:bg-red-50"
        >
          Clear Test Notifications
        </Button>
        <NotificationsDebugControls />
      </CardContent>
    </Card>
  );
};

export default NotificationsDebug;
