/**
 * Component for debugging activity and notification creation
 * This helps troubleshoot when activities or notifications aren't being created properly
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Play, Square, Bug, Bell, Activity } from 'lucide-react';
import { createLogger } from '@/utils/logger';
import { 
  startActivityMonitoring,
  startNotificationMonitoring,
  startGroupMemberMonitoring,
  getRecentActivitiesWithDuplicates,
  getRecentNotifications,
  getRecentGroupMemberActivities,
  debugGroupJoin
} from '@/utils/activityDebugUtils';

const logger = createLogger('ActivityNotificationDebugger');

interface DebugEvent {
  id: string;
  timestamp: Date;
  type: 'activity' | 'notification' | 'group_member';
  event: string;
  data: any;
}

/**
 * Real-time debugging component for activities and notifications
 * Shows what's happening in real-time when users perform actions
 */
const ActivityNotificationDebugger: React.FC = () => {
  // State for monitoring
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentGroupMembers, setRecentGroupMembers] = useState<any[]>([]);

  // Cleanup functions for monitoring
  const [cleanupFunctions, setCleanupFunctions] = useState<(() => void)[]>([]);

  /**
   * Add a debug event to our log
   */
  const addDebugEvent = (type: 'activity' | 'notification' | 'group_member', event: string, data: any) => {
    const debugEvent: DebugEvent = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      event,
      data
    };
    
    logger.debug(`[${type.toUpperCase()}] ${event}:`, data);
    
    setDebugEvents(prev => [debugEvent, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  /**
   * Start monitoring all relevant tables
   */
  const startMonitoring = () => {
    logger.info('Starting real-time monitoring for activities, notifications, and group members');
    
    const activityCleanup = startActivityMonitoring((payload) => {
      addDebugEvent('activity', 'INSERT', payload);
    });

    const notificationCleanup = startNotificationMonitoring((payload) => {
      addDebugEvent('notification', 'INSERT', payload);
    });

    const groupMemberCleanup = startGroupMemberMonitoring((payload) => {
      addDebugEvent('group_member', payload.eventType, payload);
    });

    setCleanupFunctions([activityCleanup, notificationCleanup, groupMemberCleanup]);
    setIsMonitoring(true);
  };

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    logger.info('Stopping real-time monitoring');
    
    cleanupFunctions.forEach(cleanup => cleanup());
    setCleanupFunctions([]);
    setIsMonitoring(false);
  };

  /**
   * Refresh recent data
   */
  const refreshRecentData = async () => {
    logger.info('Refreshing recent data for debugging');

    try {
      const [activities, notifications, groupMembers] = await Promise.all([
        getRecentActivitiesWithDuplicates(30), // Last 30 minutes
        getRecentNotifications(undefined, 30), // All users, last 30 minutes
        getRecentGroupMemberActivities(undefined, 30) // All groups, last 30 minutes
      ]);

      setRecentActivities(activities.activities || []);
      setRecentNotifications(notifications);
      setRecentGroupMembers(groupMembers);

      logger.info('Recent data refreshed', {
        activitiesCount: activities.activities?.length || 0,
        notificationsCount: notifications.length,
        groupMembersCount: groupMembers.length
      });
    } catch (error) {
      logger.error('Error refreshing recent data:', error);
    }
  };

  /**
   * Clear debug events
   */
  const clearEvents = () => {
    setDebugEvents([]);
    logger.info('Debug events cleared');
  };

  /**
   * Test group join debugging
   */
  const testGroupJoinDebug = async () => {
    const testGroupId = '5d0903bb-2aee-4ed8-960a-ed4d6927e7a4'; // Test group ID from network logs
    const testUserId = '18ceb1a6-9f3c-484b-ace0-22219631222b'; // Calvin Hobbes user ID
    
    logger.info('Testing group join debug functionality');
    
    try {
      const result = await debugGroupJoin(testGroupId, testUserId);
      addDebugEvent('group_member', 'DEBUG_GROUP_JOIN', result);
    } catch (error) {
      logger.error('Error testing group join debug:', error);
      addDebugEvent('group_member', 'DEBUG_GROUP_JOIN_ERROR', { error: error.message });
    }
  };

  // Load recent data on mount
  useEffect(() => {
    refreshRecentData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [cleanupFunctions]);

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Activity & Notification Debugger
          </CardTitle>
          <CardDescription>
            Monitor real-time creation of activities and notifications to troubleshoot missing notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop Monitoring
              </Button>
            )}
            
            <Button onClick={refreshRecentData} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Recent Data
            </Button>
            
            <Button onClick={clearEvents} variant="outline">
              Clear Events
            </Button>
            
            <Button onClick={testGroupJoinDebug} variant="outline">
              Test Group Join Debug
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "Monitoring Active" : "Monitoring Stopped"}
            </Badge>
            <span>Recent Activities: {recentActivities.length}</span>
            <span>Recent Notifications: {recentNotifications.length}</span>
            <span>Recent Group Members: {recentGroupMembers.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Events ({debugEvents.length})
          </CardTitle>
          <CardDescription>
            Live stream of database changes as they happen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            {debugEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events yet. Start monitoring and perform actions to see real-time updates.
              </p>
            ) : (
              <div className="space-y-2">
                {debugEvents.map((event) => (
                  <div key={event.id} className="border rounded p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={
                        event.type === 'activity' ? 'default' :
                        event.type === 'notification' ? 'secondary' :
                        'outline'
                      }>
                        {event.type}
                      </Badge>
                      <span className="font-mono">{event.event}</span>
                      <span className="text-muted-foreground ml-auto">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activities</p>
              ) : (
                <div className="space-y-2">
                  {recentActivities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="border rounded p-2 text-xs">
                      <div className="font-medium">{activity.activity_type}</div>
                      <div className="text-muted-foreground">{activity.title}</div>
                      <div className="text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {recentNotifications.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent notifications</p>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="border rounded p-2 text-xs">
                      <div className="font-medium">{notification.notification_type}</div>
                      <div className="text-muted-foreground">{notification.title}</div>
                      <div className="text-muted-foreground">
                        To: {notification.user_id}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Group Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Group Joins</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {recentGroupMembers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent group joins</p>
              ) : (
                <div className="space-y-2">
                  {recentGroupMembers.slice(0, 10).map((member) => (
                    <div key={member.id} className="border rounded p-2 text-xs">
                      <div className="font-medium">{member.profiles?.display_name || 'Unknown'}</div>
                      <div className="text-muted-foreground">
                        joined {member.groups?.name || 'Unknown Group'}
                      </div>
                      <div className="text-muted-foreground">
                        Role: {member.role}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(member.joined_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityNotificationDebugger;