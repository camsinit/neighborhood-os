
/**
 * NotificationsDebug.tsx
 * 
 * A debugging component for notifications that shows raw notification data
 * Only appears in development mode
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { createLogger } from '@/utils/logger';
import { refreshEvents } from '@/utils/refreshEvents';

const logger = createLogger('NotificationsDebug');

interface DebugNotification {
  id: string;
  title: string;
  notification_type: string;
  content_type: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  actor_id: string;
}

export const NotificationsDebug: React.FC = () => {
  const [notifications, setNotifications] = useState<DebugNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch the current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);
  
  // Function to fetch raw notifications
  const fetchRawNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    logger.debug('Fetching raw notifications for debugging');
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        logger.error('Error fetching debug notifications:', error);
        return;
      }
      
      logger.debug(`Found ${data?.length || 0} raw notifications`);
      setNotifications(data as DebugNotification[] || []);
    } catch (err) {
      logger.error('Exception in fetchRawNotifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Force a notification refresh
  const forceRefresh = () => {
    logger.debug('Manually triggering notification refresh');
    refreshEvents.notifications();
    window.dispatchEvent(new CustomEvent('notification-created'));
    setTimeout(fetchRawNotifications, 1000);
  };
  
  if (!userId) {
    return null;
  }
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Notification Debugging</h2>
      <div className="flex gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRawNotifications}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Show Raw Notifications'}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={forceRefresh} 
        >
          Force Refresh
        </Button>
      </div>
      
      {notifications.length > 0 ? (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="p-1 text-left">ID</th>
                <th className="p-1 text-left">Title</th>
                <th className="p-1 text-left">Type</th>
                <th className="p-1 text-left">Content Type</th>
                <th className="p-1 text-left">Created</th>
                <th className="p-1 text-left">Read</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-b hover:bg-gray-100">
                  <td className="p-1">{notification.id.substring(0, 8)}</td>
                  <td className="p-1">{notification.title}</td>
                  <td className="p-1">{notification.notification_type}</td>
                  <td className="p-1">{notification.content_type}</td>
                  <td className="p-1">{new Date(notification.created_at).toLocaleString()}</td>
                  <td className="p-1">{notification.is_read ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500">No notifications found</div>
      )}
    </div>
  );
};
