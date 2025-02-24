import { Activity } from "@/utils/queries/useActivities";
import { useActivities } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Book, Package, Heart, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'event_created':
    case 'event_rsvp':
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'skill_offered':
    case 'skill_requested':
      return <Book className="h-4 w-4 text-purple-500" />;
    case 'good_shared':
    case 'good_requested':
      return <Package className="h-4 w-4 text-yellow-500" />;
    case 'care_offered':
    case 'care_requested':
      return <Heart className="h-4 w-4 text-green-500" />;
    case 'safety_update':
      return <Shield className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getActivityBackground = (type: string) => {
  switch (type) {
    case 'event_created':
    case 'event_rsvp':
      return 'hover:bg-[#D3E4FD]/50';
    case 'skill_offered':
    case 'skill_requested':
      return 'hover:bg-[#E5DEFF]/50';
    case 'good_shared':
    case 'good_requested':
      return 'hover:bg-[#FEF7CD]/50';
    case 'care_offered':
    case 'care_requested':
      return 'hover:bg-[#F2FCE2]/50';
    case 'safety_update':
      return 'hover:bg-[#FDE1D3]/50';
    default:
      return 'hover:bg-gray-50';
  }
};

const getActionButton = (activity: Activity) => {
  switch (activity.activity_type) {
    case 'event_created':
    case 'event_rsvp':
      return {
        label: "View Event",
        icon: <Calendar className="h-4 w-4" />,
        variant: "outline" as const,
      };
    case 'skill_offered':
    case 'skill_requested':
      return {
        label: activity.activity_type === 'skill_offered' ? "Learn More" : "Help Out",
        icon: <Book className="h-4 w-4" />,
        variant: "outline" as const,
      };
    case 'good_shared':
    case 'good_requested':
      return {
        label: "View Item",
        icon: <Package className="h-4 w-4" />,
        variant: "outline" as const,
      };
    case 'care_offered':
    case 'care_requested':
      return {
        label: activity.activity_type === 'care_offered' ? "Request Help" : "Offer Help",
        icon: <Heart className="h-4 w-4" />,
        variant: "outline" as const,
      };
    case 'safety_update':
      return {
        label: "Read More",
        icon: <Shield className="h-4 w-4" />,
        variant: "outline" as const,
      };
    default:
      return null;
  }
};

const getActivityDescription = (metadata: Activity['metadata']) => {
  if (!metadata) return null;
  if (typeof metadata === 'object' && metadata !== null && 'description' in metadata) {
    return metadata.description as string;
  }
  return null;
};

interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}

const ActivityItem = ({ activity, onAction }: ActivityItemProps) => {
  const actionButton = getActionButton(activity);

  return (
    <div 
      className={`p-4 transition-colors ${getActivityBackground(activity.activity_type)} rounded-lg group cursor-pointer hover:shadow-md`}
      onClick={() => onAction(activity)}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={activity.profiles.avatar_url} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">
            {activity.profiles.display_name}
          </p>
          <p className="text-sm text-gray-500">
            {activity.title}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {getActivityIcon(activity.activity_type)}
              <p className="text-xs text-gray-400">
                {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            {actionButton && (
              <Button 
                variant={actionButton.variant}
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(activity);
                }}
              >
                <span className="flex items-center gap-2">
                  {actionButton.icon}
                  {actionButton.label}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedActivity?.title}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {getActivityDescription(selectedActivity?.metadata) || "No additional details available."}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ActivityFeed;
