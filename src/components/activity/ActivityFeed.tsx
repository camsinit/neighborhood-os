
import { useState, useEffect } from "react";
import { Activity, useActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ActivityItem from "./ActivityItem";
import GroupedActivityItem from "./GroupedActivityItem";
import SkillsActivityPanel from "./SkillsActivityPanel";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { groupByTimeInterval, getNonEmptyTimeGroups } from '@/utils/timeGrouping';
import { groupActivities, ActivityGroup } from '@/utils/activityGrouping';

// Create a dedicated logger for this component
const logger = createLogger('ActivityFeed');

/**
 * Component to display the feed of neighborhood activities
 * Now with activity grouping to prevent flooding from bulk operations like skills onboarding
 * Also listens for events to auto-refresh the feed when new content is added
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
  const [selectedGroup, setSelectedGroup] = useState<ActivityGroup | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Enhanced logging for debugging
  useEffect(() => {
    logger.info("Component mounted, listening for activity updates");

    if (activities) {
      logger.info(`Activities loaded: ${activities.length}`);
      
      const neighborJoinActivities = activities.filter(activity => 
        activity.activity_type === 'neighbor_joined'
      );
      
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
      }
    }

    const intervalId = setInterval(() => {
      logger.info("Performing automatic periodic refresh");
      refetch();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [activities?.length, refetch]);

  // Set up real-time subscription for activities
  useEffect(() => {
    if (!activities) return;

    const channel = supabase
      .channel('activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          logger.info('Activities data changed, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activities, refetch]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    logger.info("Manual refresh triggered");
    refetch();
    setLastRefresh(new Date());
    toast(`Feed refreshed - Last updated: ${new Date().toLocaleTimeString()}`);
  };

  // Handler for individual activity actions
  const handleActivityAction = (activity: Activity) => {
    logger.info(`Activity action triggered for ${activity.id}`);
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Handler for grouped activity clicks
  const handleGroupClick = (group: ActivityGroup) => {
    logger.info(`Group clicked with ${group.count} activities`);
    setSelectedGroup(group);
    setGroupPanelOpen(true);
  };

  // Filter out deleted activities
  const filteredActivities = activities?.filter(activity => {
    const isDeleted = !!activity.metadata?.deleted;
    if (isDeleted) {
      logger.info(`Filtered out deleted activity: ${activity.id}`);
    }
    return !isDeleted;
  }) || [];

  // Group activities to prevent flooding
  const activityGroups = groupActivities(filteredActivities);
  
  // Enhanced logging for what we're displaying
  useEffect(() => {
    if (activityGroups.length > 0) {
      const totalActivities = activityGroups.reduce((sum, group) => sum + group.count, 0);
      logger.info(`Displaying ${Math.min(displayCount, activityGroups.length)} groups representing ${totalActivities} total activities`);
      
      const groupedCount = activityGroups.filter(g => g.type === 'grouped').length;
      if (groupedCount > 0) {
        logger.info(`${groupedCount} groups are consolidated (3+ similar activities)`);
      }
    }
  }, [activityGroups, displayCount]);

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
  if (!activityGroups?.length) {
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
  
  logger.info("Rendering activity feed with grouped data");

  // Group activities by time intervals and render with section headers
  const groupedActivities = groupByTimeInterval(
    activityGroups.map(group => group.primaryActivity)
  );
  const timeGroups = getNonEmptyTimeGroups(groupedActivities);
  
  // Calculate how many items to display across all groups
  let itemsDisplayed = 0;
  const displayGroups = timeGroups.map(([interval, primaryActivities]) => {
    const remainingCount = displayCount - itemsDisplayed;
    if (remainingCount <= 0) {
      return [interval, []] as const;
    }
    
    // Get the corresponding activity groups for these primary activities
    const groupsToShow = activityGroups.filter(group => 
      primaryActivities.includes(group.primaryActivity)
    ).slice(0, remainingCount);
    
    itemsDisplayed += groupsToShow.length;
    return [interval, groupsToShow] as const;
  }).filter(([, groups]) => groups.length > 0);

  return (
    <>      
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        {displayGroups.map(([interval, groups], groupIndex) => (
          <div key={interval}>
            {/* Time interval section header */}
            <h3 className={`text-sm font-medium text-gray-500 mb-2 ${groupIndex === 0 ? 'mt-0' : 'mt-6'}`}>
              {interval}
            </h3>
            
            {/* Activities in this time group */}
            <div className="space-y-4 mb-2">
              {groups.map(group => (
                group.type === 'grouped' ? (
                  <GroupedActivityItem
                    key={group.id}
                    group={group}
                    onGroupClick={handleGroupClick}
                  />
                ) : (
                  <ActivityItem 
                    key={group.id} 
                    activity={group.primaryActivity} 
                    onAction={handleActivityAction}
                  />
                )
              ))}
            </div>
          </div>
        ))}
        
        {/* Load more button */}
        {displayCount < activityGroups.length && (
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

      {/* Individual activity details sheet */}
      <ActivityDetailsSheet 
        activity={selectedActivity} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />

      {/* Grouped activities panel */}
      <SkillsActivityPanel
        group={selectedGroup}
        open={groupPanelOpen}
        onOpenChange={setGroupPanelOpen}
      />
    </>
  );
};

export default ActivityFeed;
