
/**
 * Debug component for notifications
 * Provides tools to check notification system functionality
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  checkRsvpNotificationsForHost, 
  listAllNotificationsForUser,
  verifyRsvpRecord,
  createTestNotification
} from '@/hooks/notifications/debugNotifications';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * NotificationsDebug component for testing notification functionality
 * This is a development tool, not intended for production use
 */
export function NotificationsDebug() {
  const [hostId, setHostId] = useState('74bf3085-8275-4eb2-a721-8c8e91b3d3d8'); // Default to the specified host ID
  const [userId, setUserId] = useState('');
  const [eventId, setEventId] = useState('');
  const [results, setResults] = useState<any>(null);
  
  const { toast } = useToast();
  const user = useUser();

  // Set current user ID as default when component loads
  useState(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  });

  const handleHostCheck = async () => {
    try {
      const result = await checkRsvpNotificationsForHost(hostId);
      setResults(result);
      toast({
        title: `Found ${result.data?.length || 0} notifications`,
        description: 'Check the console for details'
      });
    } catch (error) {
      console.error('Error checking host notifications:', error);
      toast({
        title: 'Error checking notifications',
        description: 'See console for details',
        variant: 'destructive'
      });
    }
  };
  
  const handleUserCheck = async () => {
    try {
      const result = await listAllNotificationsForUser(userId);
      setResults(result);
      toast({
        title: `Found ${result.data?.length || 0} notifications`,
        description: 'Check the console for details'
      });
    } catch (error) {
      console.error('Error listing notifications:', error);
      toast({
        title: 'Error listing notifications',
        description: 'See console for details',
        variant: 'destructive'
      });
    }
  };
  
  const handleRsvpCheck = async () => {
    try {
      const result = await verifyRsvpRecord(eventId, userId);
      setResults(result);
      toast({
        title: result.found ? 'RSVP found!' : 'No RSVP record found',
        description: 'Check the console for details'
      });
    } catch (error) {
      console.error('Error verifying RSVP:', error);
      toast({
        title: 'Error verifying RSVP',
        description: 'See console for details',
        variant: 'destructive'
      });
    }
  };
  
  const handleTestNotification = async () => {
    try {
      if (!userId || !hostId) {
        toast({
          title: 'Missing information',
          description: 'Please provide both user ID and actor ID',
          variant: 'destructive'
        });
        return;
      }
      
      const result = await createTestNotification(userId, hostId);
      setResults(result);
      toast({
        title: result.success ? 'Test notification created!' : 'Failed to create test notification',
        description: 'Check the console for details'
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast({
        title: 'Error creating test notification',
        description: 'See console for details',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">Notification System Debug</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-md font-medium">Check Host Notifications</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="Host ID" 
              value={hostId} 
              onChange={e => setHostId(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleHostCheck}>Check Host</Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-md font-medium">List User Notifications</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="User ID" 
              value={userId} 
              onChange={e => setUserId(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleUserCheck}>Check User</Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-md font-medium">Verify RSVP Record</h3>
          <div className="flex gap-2 mb-2">
            <Input 
              placeholder="Event ID" 
              value={eventId} 
              onChange={e => setEventId(e.target.value)} 
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="User ID" 
              value={userId} 
              onChange={e => setUserId(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleRsvpCheck}>Verify RSVP</Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-md font-medium">Create Test Notification</h3>
          <div className="flex gap-2">
            <Button onClick={handleTestNotification} className="w-full">
              Create Test Notification (User to Host)
            </Button>
          </div>
        </div>
        
        {results && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-md font-medium">Results</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
