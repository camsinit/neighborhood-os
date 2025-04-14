
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, AlertCircle } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityIcon, getActivityColor, getActivityContext } from "./utils/activityHelpers";
import { useNavigate } from "react-router-dom";
import SkillActivityContent from "./SkillActivityContent";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { highlightItem } from "@/utils/highlightNavigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

/**
 * Props for the ActivityItem component
 */
interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}

/**
 * Helper function to format time since activity in a compact way
 */
const getCompactTimeAgo = (date: Date): string => {
  const now = new Date();
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);

  if (hours < 24) {
    return `${hours}hr`;
  } else if (days < 7) {
    return `${days}d`;
  } else if (weeks < 4) {
    return `${weeks}w`;
  } else {
    return `${months}mo`;
  }
};

/**
 * Component for displaying a single activity item in the feed
 * Now redesigned to be a compact single-line item
 */
const ActivityItem = ({
  activity,
  onAction
}: ActivityItemProps) => {
  const navigate = useNavigate();
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  
  // Check if this is a skill-related activity
  const isSkillActivity = activity.activity_type === 'skill_offered' || 
                          activity.activity_type === 'skill_requested';
                          
  // Check if the content has been deleted
  const isDeleted = activity.metadata?.deleted === true;

  /**
   * Determine the activity type and corresponding item type for highlighting
   */
  const getActivityItemType = () => {
    // Extract the base type from activity_type (e.g., skill_offered → skills)
    const baseType = activity.activity_type.split('_')[0];
    
    // Map to our standard item types
    switch (baseType) {
      case 'skill': return 'skills';
      case 'event': return 'event';
      case 'good': return 'goods';
      case 'care': return 'support';
      case 'safety': return 'safety';
      default: return 'event'; // Default fallback
    }
  };

  /**
   * Handle navigation and highlighting when View is clicked in the popover
   */
  const handleView = () => {
    if (isDeleted) {
      // For deleted content, just show the action dialog
      onAction(activity);
      return;
    }
    
    // The popover's view button will handle navigation and highlighting
    const itemType = getActivityItemType();
    highlightItem(itemType, activity.content_id, true);
  };

  // Get the activity type for the badge
  const activityType = getActivityItemType();
  const activityLabel = activityType.charAt(0).toUpperCase() + activityType.slice(1);

  // Determine if we should show an action button in the popover
  const showAction = !isDeleted && isSkillActivity;
  
  return (
    <div className="mb-2">
      <NotificationPopover
        title={isDeleted ? (activity.metadata?.original_title || activity.title) : activity.title}
        type={getActivityItemType()}
        itemId={activity.content_id}
        onAction={() => onAction(activity)}
        actionLabel={showAction ? "View Details" : undefined}
        description={isDeleted ? "This content has been deleted" : undefined}
        isArchived={isDeleted}
      >
        <div 
          className={`relative flex items-center py-2 px-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${isDeleted ? 'bg-gray-50' : ''}`}
          style={{
            borderLeft: `4px solid ${isDeleted ? '#9CA3AF' : activityColor}`
          }}
        >
          {/* Profile avatar with hover tooltip showing name */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex-shrink-0 mr-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.profiles.avatar_url} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-2">
              <p className="text-sm">{activity.profiles.display_name || "Neighbor"}</p>
            </HoverCardContent>
          </HoverCard>

          {/* Time elapsed */}
          <span className="text-xs text-gray-500 mr-3 min-w-12">
            {timeAgo}
          </span>

          {/* Activity title */}
          {isDeleted ? (
            <div className="flex items-center flex-1 min-w-0">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-500 line-through truncate">
                {activity.metadata?.original_title || activity.title}
              </p>
            </div>
          ) : (
            <div className="flex items-center flex-1 min-w-0">
              {IconComponent && (
                <IconComponent 
                  className="h-4 w-4 mr-2 flex-shrink-0" 
                  style={{ color: activityColor }} 
                />
              )}
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
            </div>
          )}

          {/* Activity type badge - right aligned */}
          <Badge 
            variant="outline" 
            className="ml-auto flex-shrink-0" 
            style={{ 
              backgroundColor: `${activityColor}10`,
              color: activityColor,
              borderColor: `${activityColor}30`
            }}
          >
            {activityLabel}
          </Badge>
        </div>
      </NotificationPopover>
    </div>
  );
};

export default ActivityItem;
