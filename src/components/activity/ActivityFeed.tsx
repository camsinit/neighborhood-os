import { useState, useEffect } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Component to display the feed of neighborhood activities
 * 
 * Now with improved error handling, recovery options and detailed debugging
 */
const ActivityFeed = () => {
  // State for controlling displayed items
  const [displayCount, setDisplayCount] = useState(4);
  const { data: activities, isLoading, error, refetch } = useActivities();
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Add debug logging to understand what's happening with the activities data
  useEffect(() => {
    // Log the raw activities data to see what we're getting
    console.log("[ActivityFeed] Raw activities data:", activities);
    
    if (activities?.length === 0) {
      console.log("[ActivityFeed] Activities array is empty");
    } else if (!activities) {
      console.log("[ActivityFeed] Activities is undefined or null");
    } else {
      console.log(`[ActivityFeed] Found ${activities.length} activities`);
      
      // Check if we're filtering out all activities
      const nonDeleted = activities.filter(activity => !activity.metadata?.deleted);
      console.log(`[ActivityFeed] After filtering deleted: ${nonDeleted.length} activities`);
    }
  }, [activities]);

  // Handler for when activities need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Filter out deleted activities, but keep a reference to see if filtering is the issue
  const allActivities = activities || [];
  const filteredActivities = allActivities.filter(activity => 
    !activity.metadata?.deleted
  );

  console.log("[ActivityFeed] All activities count:", allActivities.length);
  console.log("[ActivityFeed] Filtered activities count:", filteredActivities.length);

  // Handler for load more button
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 4);
  };
  
  // Handler for retry
  const handleRetry = () => {
    refetch();
    toast({
      title: "Retrying...",
      description: "Attempting to fetch neighborhood activities",
    });
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
  
  // Display error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error loading activity feed</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm mb-4">
            We couldn't load the neighborhood activity feed due to a database permission issue.
            This is likely related to the recent Row-Level Security policy changes.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Loading Activities
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Display a message when there are no activities
  // Ensure we properly check both the raw data and filtered data
  if (!allActivities?.length || !filteredActivities?.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center p-6">
          <p className="text-gray-500 text-lg mb-2">
            {!allActivities?.length ? "No new neighborhood activity" : "All activities have been filtered out"}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {!allActivities?.length 
              ? "Activities will appear here as neighbors post updates, create events, and share resources."
              : "There are activities in the database, but they've been filtered out, possibly because they're marked as deleted."}
          </p>
          <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
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
