
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, AlertCircle } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityIcon, getActivityColor, getActivityContext } from "./utils/activityHelpers";
import { useNavigate } from "react-router-dom";
import SkillActivityContent from "./SkillActivityContent";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { highlightItem } from "@/utils/highlightNavigation";

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
 * Now enhanced with NotificationPopover for better user interaction
 */
const ActivityItem = ({
  activity,
  onAction
}: ActivityItemProps) => {
  const navigate = useNavigate();
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  const contextText = getActivityContext(activity.activity_type);
  
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
   * The NotificationPopover component will handle this automatically
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

  // Determine if we should show an action button in the popover
  const showAction = !isDeleted && isSkillActivity;
  
  return (
    <div className="mb-2">
      <p className="text-gray-500 italic mb-0.5 text-sm">
        {contextText}
      </p>
      
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
          className={`relative flex flex-col py-3 px-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${isDeleted ? 'bg-gray-50' : ''}`}
          style={{
            borderLeft: `4px solid ${isDeleted ? '#9CA3AF' : activityColor}`
          }}
        >
          {/* Header with timestamp and avatar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">
              {timeAgo}
            </span>
            
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={activity.profiles.avatar_url} />
              <AvatarFallback>
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content - show different displays based on content type and deleted status */}
          {isDeleted ? (
            /* Deleted content display */
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-500 line-through truncate">
                  {activity.metadata?.original_title || activity.title}
                </p>
                <p className="text-sm text-gray-400">
                  This content has been deleted
                </p>
              </div>
            </div>
          ) : isSkillActivity ? (
            /* Skill activity display */
            <SkillActivityContent 
              activity={activity}
              onClick={() => onAction(activity)}
            />
          ) : (
            /* Standard activity display */
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className="flex-shrink-0">
                  <IconComponent 
                    className="h-5 w-5" 
                    style={{ color: activityColor }} 
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </NotificationPopover>
    </div>
  );
};

export default ActivityItem;
