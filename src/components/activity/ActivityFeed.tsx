
import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";

/**
 * Component to display the feed of neighborhood activities
 * Now with infinite scrolling and proper handling of deleted items
 */
const ActivityFeed = () => {
  // We'll start by showing 20 activities and load more as the user scrolls
  const [displayCount, setDisplayCount] = useState(20);
  const { data: activities, isLoading } = useActivities();
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const observerTarget = useRef(null);

  // Handler for when activities that need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Filter out deleted activities
  const filteredActivities = activities?.filter(activity => 
    !activity.metadata?.deleted
  ) || [];

  // Callback for intersection observer - load more items when user scrolls to bottom
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && filteredActivities && displayCount < filteredActivities.length) {
      // When user scrolls to the bottom, load 20 more items
      setDisplayCount(prev => Math.min(prev + 20, filteredActivities?.length || 0));
    }
  }, [filteredActivities, displayCount]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '100px', // Load more items when user is 100px away from bottom
    });
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [handleObserver]);

  // Display loading skeletons while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3].map((i) => (
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

  // Display the activities with infinite scrolling
  return (
    <>
      <div className="py-2">
        {/* Only render the number of items we want to display */}
        {filteredActivities.slice(0, displayCount).map((activity) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            onAction={handleActivityAction}
          />
        ))}
        
        {/* This empty div is used as an observer target for infinite scrolling */}
        {displayCount < filteredActivities.length && (
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-400">Loading more...</div>
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
