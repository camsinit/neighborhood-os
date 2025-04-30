
import { useState, useEffect } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw, AlertTriangle } from "lucide-react";
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
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  // Add debug logging to understand what's happening with the activities data
  useEffect(() => {
    // Log the raw activities data to see what we're getting
    if (activities) {
      console.log("[ActivityFeed] Activities data received:", activities.length);
    } else {
      console.log("[ActivityFeed] Activities is undefined or null");
    }
    
    if (activities?.length === 0) {
      console.log("[ActivityFeed] Activities array is empty");
    } else if (activities && activities.length > 0) {
      console.log(`[ActivityFeed] Found ${activities.length} activities`);
      console.log("[ActivityFeed] First activity:", activities[0]);
      
      // Check if we're filtering out all activities
      const nonDeleted = activities.filter(activity => !activity.metadata?.deleted);
      console.log(`[ActivityFeed] After filtering deleted: ${nonDeleted.length} activities`);
      
      // Check if any activities are missing the profiles property
      const missingProfiles = activities.filter(activity => !activity.profiles);
      if (missingProfiles.length > 0) {
        console.warn(`[ActivityFeed] ${missingProfiles.length} activities are missing profiles property`);
      }
    }
  }, [activities]);

  // Handler for when activities need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Toggle dev mode for debugging
  const toggleDevMode = () => {
    setDevModeEnabled(prev => !prev);
  };

  // Filter out deleted activities
  const filteredActivities = activities?.filter(activity => 
    !activity.metadata?.deleted
  ) || [];

  // Handler for load more button
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 4);
  };
  
  // Handler for retry
  const handleRetry = () => {
    refetch();
    toast({
      title: "Refreshing activity feed",
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
        <AlertTriangle className="h-5 w-5 mr-2" />
        <AlertTitle>Error loading activity feed</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm mb-4">
            We couldn't load the neighborhood activity feed. This might be related to database permissions.
            {devModeEnabled && (
              <span className="block mt-2 text-xs font-mono">
                Error: {error instanceof Error ? error.message : "Unknown error"}
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Loading
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDevMode}
            >
              {devModeEnabled ? "Hide Developer Info" : "Show Developer Info"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Display a message when there are no activities
  if (!activities || activities.length === 0 || filteredActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center p-6">
          <p className="text-gray-500 text-lg mb-2">
            No neighborhood activity to display
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Activities will appear here as neighbors post updates, create events, and share resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            
            {process.env.NODE_ENV !== 'production' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDevMode}
              >
                {devModeEnabled ? "Hide Developer Info" : "Show Developer Info"}
              </Button>
            )}
          </div>
          
          {/* Developer debugging info */}
          {devModeEnabled && (
            <div className="mt-4 p-3 bg-gray-100 text-left rounded text-xs font-mono text-gray-700 max-h-60 overflow-auto">
              <p>Total activities received: {activities?.length || 0}</p>
              <p>Activities after filtering: {filteredActivities.length}</p>
              <p>First activity title: {activities?.[0]?.title || 'None'}</p>
              <p>Has profiles property: {activities?.[0]?.profiles ? 'Yes' : 'No'}</p>
              <p>User ID: {(window as any).user_id || 'unknown'}</p>
              <p>Neighborhood ID: {(window as any).neighborhood_id || 'unknown'}</p>
            </div>
          )}
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
        
        {/* Developer mode toggle */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="flex justify-end pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDevMode}
              className="text-xs"
            >
              {devModeEnabled ? "Hide Developer Info" : "Show Developer Info"}
            </Button>
          </div>
        )}
        
        {/* Developer debugging info */}
        {devModeEnabled && (
          <div className="mt-2 p-3 bg-gray-100 text-left rounded text-xs font-mono text-gray-700 max-h-60 overflow-auto">
            <p>Total activities: {activities.length}</p>
            <p>Filtered activities: {filteredActivities.length}</p>
            {activities.length > 0 && (
              <>
                <p className="mt-2 font-bold">Sample Activity:</p>
                <pre>{JSON.stringify(activities[0], null, 2)}</pre>
              </>
            )}
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
