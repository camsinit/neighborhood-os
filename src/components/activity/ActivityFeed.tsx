
import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

/**
 * Component to display the feed of neighborhood activities
 * Now with load more button and initial limit of 4 items
 * Also listens for events to auto-refresh the feed
 */
const ActivityFeed = () => {
  // State for controlling displayed items
  const [displayCount, setDisplayCount] = useState(4);
  const { data: activities, isLoading, refetch } = useActivities();
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Set up event listener for activity updates
  useEffect(() => {
    // Function to handle the refresh event
    const handleRefresh = () => {
      console.log("[ActivityFeed] Received activities-updated event, refreshing data");
      refetch();
    };

    // Listen for custom refresh events
    window.addEventListener('activities-updated', handleRefresh);
    window.addEventListener('event-rsvp-updated', handleRefresh);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('activities-updated', handleRefresh);
      window.removeEventListener('event-rsvp-updated', handleRefresh);
    };
  }, [refetch]);

  // Handler for when activities need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Filter out deleted activities
  const filteredActivities = activities?.filter(activity => 
    !activity.metadata?.deleted
  ) || [];

  // Handler for load more button
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 4);
  };

  // Display loading skeletons while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3, 4].map((i) => (
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
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">No new neighborhood activity</p>
      </div>
    );
  }

  // Display the activities with load more button
  return (
    <>
      <div className="py-2 space-y-4">
        {/* Only render the number of items we want to display */}
        {filteredActivities.slice(0, displayCount).map((activity) => (
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
              onClick={handleLoadMore}
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
