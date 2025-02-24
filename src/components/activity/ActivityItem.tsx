
import { format } from "date-fns";
import { User } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getActivityIcon, getActivityBackground, getActionButton } from "./utils/activityHelpers";

interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}

const ActivityItem = ({ activity, onAction }: ActivityItemProps) => {
  const actionButton = getActionButton(activity);
  const IconComponent = getActivityIcon(activity.activity_type);

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
              {IconComponent && <IconComponent className={`h-4 w-4 ${
                activity.activity_type.includes('event') ? 'text-blue-500' :
                activity.activity_type.includes('skill') ? 'text-purple-500' :
                activity.activity_type.includes('good') ? 'text-yellow-500' :
                activity.activity_type.includes('care') ? 'text-green-500' :
                'text-red-500'
              }`} />}
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
                  <actionButton.icon className="h-4 w-4" />
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

export default ActivityItem;
