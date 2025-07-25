/**
 * Activity Debug Panel
 * 
 * Comprehensive debugging tools for tracking activity creation issues
 * and managing activities for super admins
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, RefreshCw, Bug, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { Activity, useActivities } from '@/hooks/useActivities';

const logger = createLogger('ActivityDebugPanel');

export const ActivityDebugPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [debugDeleteMode, setDebugDeleteMode] = useState(false);
  
  // Get all activities for the delete functionality
  const { data: allActivities, refetch: refetchActivities } = useActivities();

  // Debug: Delete individual activity function for super admins
  const handleDeleteActivity = async (activityId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_activity_debug', {
        activity_id: activityId
      });

      if (error) throw error;

      if (data) {
        toast.success("Activity deleted successfully");
        refetchActivities(); // Refresh the activities list
        analyzeActivities(); // Refresh the analysis
      } else {
        toast.error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Error deleting activity");
    }
  };

  // Query to get detailed activity information with duplicates
  const analyzeActivities = async () => {
    setIsRunning(true);
    
    try {
      logger.debug('Starting comprehensive activity analysis...');
      
      // Get all activities from the last hour with full details
      const { data: activities, error } = await supabase
        .from('activities')
        .select(`
          id,
          actor_id,
          activity_type,
          content_id,
          content_type,
          title,
          neighborhood_id,
          created_at,
          metadata,
          profiles:actor_id (
            display_name
          )
        `)
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setActivityData(activities || []);

      // Analyze for duplicates
      const duplicateAnalysis = analyzeForDuplicates(activities || []);
      
      // Get recent database logs (simplified approach)
      const recentLogs = 'Database trigger analysis available via SQL queries';

      setDebugResults({
        totalActivities: activities?.length || 0,
        duplicateAnalysis,
        triggerInfo: 'Check database triggers manually via SQL Editor',
        recentLogs,
        timestamp: new Date().toISOString()
      });

      toast.success('Activity analysis complete - check results below');
      
    } catch (error) {
      logger.error('Error analyzing activities:', error);
      toast.error('Failed to analyze activities: ' + (error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  // Analyze activities for potential duplicates
  const analyzeForDuplicates = (activities: any[]) => {
    const duplicateGroups: any = {};
    const suspiciousPatterns: any[] = [];

    activities.forEach(activity => {
      // Group by content_id and content_type
      const key = `${activity.content_type}_${activity.content_id}`;
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(activity);
    });

    // Find groups with multiple activities
    Object.entries(duplicateGroups).forEach(([key, group]: [string, any]) => {
      if (group.length > 1) {
        suspiciousPatterns.push({
          key,
          count: group.length,
          activities: group,
          timeDifference: new Date(group[0].created_at).getTime() - new Date(group[group.length - 1].created_at).getTime()
        });
      }
    });

    return {
      totalGroups: Object.keys(duplicateGroups).length,
      duplicateGroups: suspiciousPatterns,
      hasDuplicates: suspiciousPatterns.length > 0
    };
  };

  // Create a test safety update to trigger the issue
  const createTestSafetyUpdate = async () => {
    try {
      logger.debug('Creating test safety update to trigger debugging...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Must be logged in to create test');
        return;
      }

      // Get user's neighborhood
      const { data: neighborhoods } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .limit(1);

      if (!neighborhoods || neighborhoods.length === 0) {
        toast.error('No neighborhood found');
        return;
      }

      const { data, error } = await supabase
        .from('safety_updates')
        .insert({
          title: `DEBUG TEST ${new Date().toISOString()}`,
          description: 'This is a test safety update for debugging duplicate activities',
          type: 'Information',
          author_id: user.user.id,
          neighborhood_id: neighborhoods[0].neighborhood_id
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success('Test safety update created - check for duplicate activities');
      
      // Wait a moment then refresh analysis
      setTimeout(() => {
        analyzeActivities();
      }, 2000);

    } catch (error) {
      logger.error('Error creating test safety update:', error);
      toast.error('Failed to create test: ' + (error as Error).message);
    }
  };

  // Clean up duplicate activities with improved error handling
  const cleanupDuplicates = async () => {
    if (!debugResults?.duplicateAnalysis?.duplicateGroups?.length) {
      toast.error('No duplicates found to clean up');
      return;
    }

    try {
      logger.debug('Cleaning up duplicate activities...');
      
      let cleanedCount = 0;
      let errorCount = 0;
      
      for (const group of debugResults.duplicateAnalysis.duplicateGroups) {
        // Keep the first activity (oldest), delete the newer duplicates
        const toDelete = group.activities.slice(1);
        
        for (const activity of toDelete) {
          const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', activity.id);
            
          if (!error) {
            cleanedCount++;
            logger.debug(`Deleted duplicate activity: ${activity.id}`);
          } else {
            errorCount++;
            logger.error(`Failed to delete activity ${activity.id}:`, error);
          }
        }
      }
      
      if (cleanedCount > 0) {
        toast.success(`Successfully cleaned up ${cleanedCount} duplicate activities`);
      }
      
      if (errorCount > 0) {
        toast.warning(`${errorCount} duplicates couldn't be deleted due to permissions`);
      }
      
      // Refresh the analysis
      analyzeActivities();
      
    } catch (error) {
      logger.error('Error cleaning up duplicates:', error);
      toast.error('Failed to cleanup: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Analysis Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" />
            Activity Debug Panel
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive debugging tools for tracking duplicate activity creation
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={analyzeActivities} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isRunning ? 'Analyzing...' : 'Analyze Activities'}
            </Button>
            
            <Button 
              onClick={createTestSafetyUpdate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Create Test Safety Update
            </Button>
            
            {debugResults?.duplicateAnalysis?.hasDuplicates && (
              <Button 
                onClick={cleanupDuplicates}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clean Up Duplicates
              </Button>
            )}
          </div>

          {debugResults && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Analysis Summary</h4>
                <div className="text-sm space-y-1">
                  <div>Total Activities (last hour): {debugResults.totalActivities}</div>
                  <div>Duplicate Groups Found: {debugResults.duplicateAnalysis?.duplicateGroups?.length || 0}</div>
                  <div>Analysis Time: {new Date(debugResults.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Duplicate Analysis */}
              {debugResults.duplicateAnalysis?.hasDuplicates && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium mb-2 text-red-800">🚨 Duplicate Activities Found!</h4>
                  <div className="space-y-2">
                    {debugResults.duplicateAnalysis.duplicateGroups.map((group: any, index: number) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{group.key}</span>
                          <Badge variant="destructive">{group.count} duplicates</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Time difference: {group.timeDifference}ms
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-blue-600">Show activities</summary>
                          <div className="mt-1 space-y-1">
                            {group.activities.map((activity: any) => (
                              <div key={activity.id} className="text-xs bg-gray-50 p-1 rounded">
                                ID: {activity.id.slice(0, 8)}... | 
                                Created: {new Date(activity.created_at).toLocaleTimeString()} |
                                Title: {activity.title}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activities List */}
              {activityData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Activities (Last Hour)</h4>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {activityData.map((activity) => (
                      <div key={activity.id} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-xs text-gray-600">
                              {activity.activity_type} | {activity.content_type} | 
                              {activity.profiles?.display_name || 'Unknown User'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Content ID: {activity.content_id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trigger Information */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Database Trigger Info</h4>
                <p className="text-sm text-gray-700">
                  Use the SQL Editor to check triggers manually. The deadlock prevented automatic trigger cleanup.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>How to use:</strong> Click "Analyze Activities" to see recent activity creation patterns. 
              Use "Create Test Safety Update" to trigger the duplicate issue and immediately analyze what happens.
              If duplicates are found, you can clean them up with the cleanup button.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Management Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Activity Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View and manage all activities in the system
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Debug Delete Mode Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Debug Delete Mode</h4>
              <p className="text-sm text-muted-foreground">
                Enable delete buttons for individual activities
              </p>
            </div>
            <Button
              variant={debugDeleteMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setDebugDeleteMode(!debugDeleteMode)}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {debugDeleteMode ? "Exit Debug Mode" : "Debug Delete Mode"}
            </Button>
          </div>

          {/* All Activities List */}
          {allActivities && allActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">All Activities</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {allActivities.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded text-sm bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Type: {activity.activity_type} | Content: {activity.content_type}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(activity.created_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {activity.id}
                        </div>
                      </div>
                      {debugDeleteMode && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <strong>⚠️ Warning:</strong> Debug delete mode allows you to permanently delete activities. 
              This action cannot be undone and should only be used for debugging purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
