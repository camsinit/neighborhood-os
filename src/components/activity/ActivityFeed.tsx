
import { useState } from "react";
import { Activity, useActivities } from "@/utils/queries/useActivities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ActivityItem from "./ActivityItem";
import ActivityDetailsSheet from "./ActivityDetailsSheet";

const ActivityFeed = () => {
  const { data: activities, isLoading } = useActivities();
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleActivityAction = (activity: Activity) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
    
    toast({
      title: "Opening details",
      description: `Viewing details for ${activity.title}`,
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-gray-500">No new neighborhood activity</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
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
