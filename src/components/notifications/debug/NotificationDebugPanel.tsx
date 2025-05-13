
/**
 * NotificationDebugPanel.tsx
 * 
 * A development tool for debugging notification issues 
 * This component is only meant to be used during development
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Eye, Archive, Send } from "lucide-react";
import { useNotifications } from "@/hooks/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/utils/logger";
import refreshEvents from "@/utils/refreshEvents";
import { toast } from "sonner";

// Create a logger for this component
const logger = createLogger('NotificationDebugPanel');

/**
 * Notification debug panel for troubleshooting notification issues
 * This component should only be included in development builds
 */
export const NotificationDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventListeners, setEventListeners] = useState<Record<string, number>>({});
  const [lastEvents, setLastEvents] = useState<{name: string, timestamp: string}[]>([]);
  
  // Get query client and notification data
  const queryClient = useQueryClient();
  const { data: notifications, refetch } = useNotifications(false);
  
  // Track DOM events for debugging
  useEffect(() => {
    const trackEvent = (e: Event) => {
      setLastEvents(prev => [
        { name: e.type, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9) // Keep only the last 10 events
      ]);
      logger.debug(`Detected event: ${e.type}`);
    };
    
    // Listen for notification-related events
    window.addEventListener('event-rsvp-updated', trackEvent);
    window.addEventListener('notification-created', trackEvent);
    window.addEventListener('event-submitted', trackEvent);
    window.addEventListener('skills-updated', trackEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('event-rsvp-updated', trackEvent);
      window.removeEventListener('notification-created', trackEvent);
      window.removeEventListener('event-submitted', trackEvent);
      window.removeEventListener('skills-updated', trackEvent);
    };
  }, []);
  
  // Update event listener counts periodically
  useEffect(() => {
    if (!isOpen) return;
    
    const intervalId = setInterval(() => {
      setEventListeners(refreshEvents.debug());
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [isOpen]);
  
  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  // Event dispatch handlers
  const triggerEvent = (eventType: string) => {
    logger.info(`Manually triggering event: ${eventType}`);
    window.dispatchEvent(new CustomEvent(eventType));
    toast.info(`Dispatched ${eventType} event`);
    
    setLastEvents(prev => [
      { name: `${eventType} (manual)`, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };
  
  // Handle force refresh
  const forceRefresh = () => {
    logger.info("Forcing notification refresh");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    refetch();
    toast.info("Forced notification refresh");
  };
  
  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 z-50 bg-orange-100 hover:bg-orange-200 border-orange-300"
        onClick={() => setIsOpen(true)}
      >
        Debug Notifications
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-orange-600">Notification Debug</CardTitle>
          <CardDescription>Troubleshooting tools</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Event statistics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Event Listeners</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(eventListeners).map(([event, count]) => (
              <div key={event} className="flex justify-between bg-gray-50 p-1.5 rounded">
                <span>{event}:</span>
                <span className="font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Events */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Events</h4>
          <div className="max-h-24 overflow-auto text-xs space-y-1">
            {lastEvents.length > 0 ? (
              lastEvents.map((event, i) => (
                <div key={i} className="flex justify-between bg-gray-50 p-1 rounded">
                  <span>{event.name}</span>
                  <span className="text-gray-500">{event.timestamp}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center p-2">No events detected</p>
            )}
          </div>
        </div>
        
        {/* Notification stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Notification Stats</h4>
          <div className="text-xs">
            <div className="flex justify-between bg-gray-50 p-1.5 rounded">
              <span>Total notifications:</span>
              <span className="font-mono">{notifications?.length || 0}</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-1.5 rounded mt-1">
              <span>Unread:</span>
              <span className="font-mono">{notifications?.filter(n => !n.is_read).length || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => triggerEvent('notification-created')}
            className="text-xs h-8"
          >
            <Send className="h-3 w-3 mr-1" />
            Trigger Notification
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={() => triggerEvent('event-rsvp-updated')}
            className="text-xs h-8"
          >
            <Send className="h-3 w-3 mr-1" />
            Trigger RSVP
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={forceRefresh}
            className="text-xs h-8 col-span-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Force Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebugPanel;
