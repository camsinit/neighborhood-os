
/**
 * Optimized Activity Feed Component
 * 
 * Simplified version with minimal logging and efficient rendering
 * Now uses the consolidated useActivities hook
 */
import { useState } from "react";
import { useActivities } from "@/hooks/useActivities"; // Updated import to use consolidated hook
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";
import type { Activity } from "@/hooks/useActivities";

const ActivityFeedOptimized = () => {
  const [displayCount, setDisplayCount] = useState(6); // Increased default
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { data: activities, isLoading, refetch, isRefetching } = useActivities();

  // Handle activity selection
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Manual refresh
  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
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

  // Empty state
  if (!activities?.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No neighborhood activity yet</p>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-2 space-y-4">
        {activities.slice(0, displayCount).map(activity => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            onAction={handleActivityAction} 
          />
        ))}
        
        {displayCount < activities.length && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="w-full max-w-[200px]"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Load More ({activities.length - displayCount} remaining)
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

export default ActivityFeedOptimized;
