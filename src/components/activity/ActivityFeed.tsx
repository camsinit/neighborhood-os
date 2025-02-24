
import { Activity } from "@/utils/queries/useActivities";
import { useActivities } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Book, Package, Heart, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

const ActivityItem = ({ activity }: { activity: Activity }) => {
  return (
    <div className={`p-4 transition-colors ${getActivityBackground(activity.activity_type)} rounded-lg group cursor-pointer`}>
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
          <div className="flex items-center gap-2">
            {getActivityIcon(activity.activity_type)}
            <p className="text-xs text-gray-400">
              {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed = () => {
  const { data: activities, isLoading } = useActivities();

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

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 pr-4">
        {activities?.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ActivityFeed;
