
import { useState, useEffect } from "react";
import { Activity, useActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useAutoRefreshOptimized } from "@/hooks/useAutoRefreshOptimized";
import { createLogger } from '@/utils/logger';
import { groupByTimeInterval, getNonEmptyTimeGroups } from '@/utils/timeGrouping';

// Create a dedicated logger for this component
const logger = createLogger('ActivityFeed');

/**
 * Component to display the feed of neighborhood activities
 * Now with load more button and initial limit of 4 items
 * Also listens for events to auto-refresh the feed when new content is added
 * 
 * ENHANCED: Added debugging for neighbor join activities and goods activities specifically
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

  // Enhanced logging for debugging neighbor join and goods activities
  useEffect(() => {
    logger.info("Component mounted, listening for activity updates");

    // Log if we have data with specific focus on neighbor and goods activities
    if (activities) {
      logger.info(`Activities loaded: ${activities.length}`);
      
      // Debug: Log neighbor join activities specifically
      const neighborJoinActivities = activities.filter(activity => 
        activity.activity_type === 'neighbor_joined'
      );
      
      // Debug: Log goods activities specifically
      const goodsActivities = activities.filter(activity => 
        activity.activity_type === 'good_shared' || activity.activity_type === 'good_requested'
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
        logger.info("No neighbor join activities found in current feed");
      }
      
      if (goodsActivities.length > 0) {
        logger.info(`Found ${goodsActivities.length} goods activities:`, 
          goodsActivities.map(a => ({ 
            id: a.id, 
            title: a.title, 
            activity_type: a.activity_type,
            created_at: a.created_at,
            actor_id: a.actor_id 
          }))
        );
      } else {
        logger.info("No goods activities found in current feed");
      }
    }

    // Set up periodic refetching every 30 seconds
    const intervalId = setInterval(() => {
      logger.info("Performing automatic periodic refresh");
      refetch();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [activities?.length, refetch]);

  // Use our optimized auto-refresh hook to listen for ALL activity types
  useAutoRefreshOptimized([
    'activities', 
    'events', 
    'safety', 
    'goods',
    'skills',
    'neighbors'
  ], refetch);

  // Manual refresh handler with enhanced logging
  const handleManualRefresh = () => {
    logger.info("Manual refresh triggered - checking for new neighbor and goods activities");
    refetch();
    setLastRefresh(new Date());
    toast(`Feed refreshed - Last updated: ${new Date().toLocaleTimeString()}`);
  };

  // Handler for when activities need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    logger.info(`Activity action triggered for ${activity.id}`);
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Filter out deleted activities and log what we're showing
  const filteredActivities = activities?.filter(activity => {
    const isDeleted = !!activity.metadata?.deleted;
    if (isDeleted) {
      logger.info(`Filtered out deleted activity: ${activity.id}`);
    }
    return !isDeleted;
  }) || [];

  // Enhanced logging for what we're actually displaying
  useEffect(() => {
    if (filteredActivities.length > 0) {
      logger.info(`Displaying ${Math.min(displayCount, filteredActivities.length)} activities out of ${filteredActivities.length} total`);
      
      // Log the activity types we're showing for debugging
      const activityTypeBreakdown = filteredActivities.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      logger.info("Activity type breakdown:", activityTypeBreakdown);
    }
  }, [filteredActivities, displayCount]);

  // Display loading skeletons while data is being fetched
  if (isLoading) {
    logger.info("Rendering loading skeletons");
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
    logger.info("No activities to display");
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
  
  logger.info("Rendering activity feed with data");

  // Group activities by time intervals and render with section headers
  const groupedActivities = groupByTimeInterval(filteredActivities);
  const timeGroups = getNonEmptyTimeGroups(groupedActivities);
  
  // Calculate how many items to display across all groups
  let itemsDisplayed = 0;
  const displayGroups = timeGroups.map(([interval, items]) => {
    const remainingCount = displayCount - itemsDisplayed;
    if (remainingCount <= 0) {
      return [interval, []] as const;
    }
    
    const itemsToShow = items.slice(0, remainingCount);
    itemsDisplayed += itemsToShow.length;
    return [interval, itemsToShow] as const;
  }).filter(([, items]) => items.length > 0);

  return (
    <>      
      <div className="py-2 bg-white rounded-lg border border-gray-200">
        {displayGroups.map(([interval, items], groupIndex) => (
          <div key={interval}>
            {/* Time interval section header */}
            <h3 className={`text-sm font-medium text-gray-500 mb-2 ${groupIndex === 0 ? 'mt-0' : 'mt-6'}`}>
              {interval}
            </h3>
            
            {/* Activities in this time group */}
            <div className="space-y-4 mb-2">
              {items.map(activity => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  onAction={handleActivityAction}
                />
              ))}
            </div>
          </div>
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
