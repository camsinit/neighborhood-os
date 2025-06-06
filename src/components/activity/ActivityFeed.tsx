
import { useState, useEffect } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // Updated import to use Sonner directly
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this component
const logger = createLogger('ActivityFeed');

/**
 * Component to display the feed of neighborhood activities
 * Now with load more button and initial limit of 4 items
 * Also listens for events to auto-refresh the feed when new content is added
 * 
 * ENHANCED: Added debugging for neighbor join activities specifically
 */
const ActivityFeed = () => {
  // State for controlling displayed items
  const [displayCount, setDisplayCount] = useState(4);
  const {
    data: activities,
    isLoading,
    refetch,
    isRefetching
  } = useActivities();
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Enhanced logging for debugging neighbor join activities
  useEffect(() => {
    logger.info("Component mounted, listening for activity updates");

    // Log if we have data with specific focus on neighbor activities
    if (activities) {
      logger.info(`Activities loaded: ${activities.length}`);
      
      // Debug: Log neighbor join activities specifically
      const neighborJoinActivities = activities.filter(activity => 
        activity.activity_type === 'neighbor_joined'
      );
      
      if (neighborJoinActivities.length > 0) {
        logger.info(`Found ${neighborJoinActivities.length} neighbor join activities:`, 
          neighborJoinActivities.map(a => ({ 
            id: a.id, 
            title: a.title, 
            created_at: a.created_at,
            actor_id: a.actor_id 
          }))
        );
      } else {
        logger.warn("No neighbor join activities found in current feed");
      }
    }

    // Set up periodic refetching every 30 seconds
    const intervalId = setInterval(() => {
      logger.debug("Performing automatic periodic refresh");
      refetch();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [activities?.length, refetch]);

  // Use our centralized auto-refresh hook to listen for ALL activity types
  // This ensures the feed refreshes for skills, events, safety updates, etc.
  // ENHANCED: Added 'neighbor-joined' event specifically
  useAutoRefresh(['activities'], [
    'activities-updated', 
    'event-rsvp-updated', 
    'event-submitted', 
    'event-deleted', 
    'safety-updated', 
    'goods-updated', 
    'skills-updated',
    'neighbor-joined' // Added this to catch neighbor join events
  ]);

  // Manual refresh handler with enhanced logging
  const handleManualRefresh = () => {
    logger.debug("Manual refresh triggered - checking for new neighbor activities");
    refetch();
    setLastRefresh(new Date());
    toast(`Feed refreshed - Last updated: ${new Date().toLocaleTimeString()}`);
  };

  // Handler for when activities need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    logger.debug(`Activity action triggered for ${activity.id}`);
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Filter out deleted activities and log what we're showing
  const filteredActivities = activities?.filter(activity => {
    const isDeleted = !!activity.metadata?.deleted;
    if (isDeleted) {
      logger.debug(`Filtered out deleted activity: ${activity.id}`);
    }
    return !isDeleted;
  }) || [];

  // Enhanced logging for what we're actually displaying
  useEffect(() => {
    if (filteredActivities.length > 0) {
      logger.debug(`Displaying ${Math.min(displayCount, filteredActivities.length)} activities out of ${filteredActivities.length} total`);
      
      // Log the activity types we're showing for debugging
      const activityTypeBreakdown = filteredActivities.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      logger.debug("Activity type breakdown:", activityTypeBreakdown);
    }
  }, [filteredActivities, displayCount]);

  // Display loading skeletons while data is being fetched
  if (isLoading) {
    logger.debug("Rendering loading skeletons");
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-40 flex-1" />
            <Skeleton className="h-6 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Display a message when there are no activities
  if (!filteredActivities?.length) {
    logger.debug("No activities to display");
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No new neighborhood activity</p>
          <Button variant="outline" onClick={handleManualRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }
  
  logger.debug("Rendering activity feed with data");

  // Display the activities with load more button
  return (
    <>
      <div className="py-2 space-y-4">
        {/* Only render the number of items we want to display */}
        {filteredActivities.slice(0, displayCount).map(activity => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            onAction={handleActivityAction} 
          />
        ))}
        
        {/* Load more button */}
        {displayCount < filteredActivities.length && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDisplayCount(prev => prev + 4)} 
              className="w-full max-w-[200px]"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Load More
            </Button>
          </div>
        )}
      </div>

      <ActivityDetailsSheet 
        activity={selectedActivity} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </>
  );
};

export default ActivityFeed;
