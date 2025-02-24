
import { format, formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  getActivityIcon, 
  getActionButton,
  getActivityColor 
} from "./utils/activityHelpers";

interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}

const ActivityItem = ({ activity, onAction }: ActivityItemProps) => {
  // Get icon and styling details
  const actionButton = getActionButton(activity);
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  
  // Calculate time ago
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

  return (
    <div 
      className="relative flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onAction(activity)}
      style={{ 
        borderLeft: `4px solid ${activityColor}` 
      }}
    >
      {/* Activity Type Icon */}
      {IconComponent && (
        <div className="flex-shrink-0 mt-1">
          <IconComponent 
            className="h-5 w-5"
            style={{ color: activityColor }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <p className="text-sm font-medium text-gray-900 mb-1">
          {activity.title}
        </p>

        {/* Action Button */}
        {actionButton && (
          <Button 
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onAction(activity);
            }}
          >
            <span className="flex items-center gap-2">
              <actionButton.icon className="h-4 w-4" />
              {actionButton.label}
            </span>
          </Button>
        )}
      </div>

      {/* Time and Avatar */}
      <div className="flex items-start gap-2 flex-shrink-0">
        <span className="text-xs text-gray-500 mt-1">
          {timeAgo}
        </span>
        <Avatar className="h-6 w-6">
          <AvatarImage src={activity.profiles.avatar_url} />
          <AvatarFallback>
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ActivityItem;
