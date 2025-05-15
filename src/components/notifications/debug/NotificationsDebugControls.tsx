
/**
 * NotificationsDebugControls.tsx
 * 
 * Component that provides developer tools for testing notifications
 * Only visible in development mode
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const logger = createLogger('NotificationsDebug');

/**
 * Debug controls for testing notifications functionality
 */
const NotificationsDebugControls: React.FC = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  // Fetch current user on mount
  React.useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    }
    getUser();
  }, []);
  
  // Create a test notification in the database
  const createTestNotification = async () => {
    try {
      setLoading(true);
      
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
        logger.error("Error creating test notification:", error);
        toast.error("Failed to create test notification");
        return;
      }
      
      // Dispatch events to refresh notifications
      window.dispatchEvent(new CustomEvent('notification-created'));
      refreshEvents.notifications();
      
      toast.success("Test notification created successfully");
      logger.debug("Created test notification:", notification);
      
    } catch (error) {
      logger.error("Error in createTestNotification:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  // Force refresh notifications
  const forceRefresh = () => {
    logger.debug("Manual notification refresh triggered");
    window.dispatchEvent(new CustomEvent('notification-created'));
    refreshEvents.notifications();
    toast.success("Notification refresh triggered");
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Notification Debugging</CardTitle>
      </CardHeader>
      
      <CardContent className="text-xs">
        <div className="grid gap-1">
          <p>User ID: {userId || 'Loading...'}</p>
          <p>Mode: {import.meta.env.DEV ? 'Development' : 'Production'}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button 
          size="sm" 
          variant="outline"
          disabled={loading}
          onClick={createTestNotification}
        >
          Create Test Notification
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={forceRefresh}
        >
          Force Refresh
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationsDebugControls;
