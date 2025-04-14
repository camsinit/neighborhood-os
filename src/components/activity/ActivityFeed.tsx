
import { useState } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";

/**
 * Component to display the feed of neighborhood activities
 * Updated for improved spacing and visual consistency
 */
const ActivityFeed = () => {
  const { data: activities, isLoading } = useActivities();
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Handler for when activities that need special handling (like deleted items)
  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
  };

  // Display loading skeletons while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-48 flex-1" />
            <Skeleton className="h-6 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Display a message when there are no activities
  if (!activities?.length) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-base">No new neighborhood activity</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[500px] pr-2">
        <div className="py-2">
          {activities.map((activity) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity} 
              onAction={handleActivityAction}
            />
          ))}
        </div>
      </ScrollArea>

      <ActivityDetailsSheet
        activity={selectedActivity}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};

export default ActivityFeed;
