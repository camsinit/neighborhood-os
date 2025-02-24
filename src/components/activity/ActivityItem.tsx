import { formatDistanceToNow } from "date-fns";
import { User, Archive } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getActivityIcon, getActivityColor, getActivityContext } from "./utils/activityHelpers";
interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}
const ActivityItem = ({
  activity,
  onAction
}: ActivityItemProps) => {
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
    addSuffix: true
  });
  const contextText = getActivityContext(activity.activity_type);
  const handleClick = () => {
    // Dispatch custom event for navigation
    const event = new CustomEvent('openActivityDialog', {
      detail: {
        type: activity.activity_type.split('_')[0],
        // Extract base type (event, skill, etc.)
        id: activity.content_id,
        title: activity.title
      }
    });
    window.dispatchEvent(event);
  };
  return <div className="mb-2">
      <p className="text-gray-500 italic mb-0.5 text-sm">
        {contextText}
      </p>
      
      <div onClick={handleClick} className="h-[64px] relative flex items-center gap-3 py-2 px-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" style={{
      borderLeft: `4px solid ${activityColor}`
    }}>
        {/* Activity Type Icon */}
        {IconComponent && <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5" style={{
          color: activityColor
        }} />
          </div>}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">
            {activity.title}
          </p>
        </div>

        {/* Time and Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-500">
            {timeAgo}
          </span>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={activity.profiles.avatar_url} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>;
};
export default ActivityItem;