
/**
 * ActivityItem component that shows a single activity in the feed
 * with enhanced details about the specific action
 */
import React from "react";
import { Activity } from "@/utils/queries/useActivities";
import { useNavigate } from "react-router-dom";
import { navigateAndHighlight } from "@/utils/highlight";
import { getActivityColor } from "./utils/activityHelpers";
import { getCompactTimeAgo } from "./utils/timeFormatters";
// Fix import to use the correct function name from activityLabels.ts
import { getActivityHighlightType } from "./utils/activityLabels";
import ActivityAvatar from "./ActivityAvatar";
import ActivityBadge from "./ActivityBadge";
import ActivityTitle from "./ActivityTitle";

/**
 * Props for the ActivityItem component
 */
interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
}

/**
 * Component for displaying a single activity item in the feed
 * Now with enhanced action details in the badge and improved context passing
 */
const ActivityItem = ({ activity, onAction }: ActivityItemProps) => {
  const navigate = useNavigate();
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  
  // Extract action from metadata for more specific badge labeling
  // This allows us to show badges like "Event Created" instead of just "Event"
  const action = activity.metadata?.action;
  
  // Check if the content has been deleted
  const isDeleted = activity.metadata?.deleted === true;

  /**
   * Handle click on activity item - navigates directly to the content
   */
  const handleItemClick = () => {
    if (isDeleted) {
      // For deleted content, show the action dialog
      onAction(activity);
      return;
    }
    
    // Navigate to the item and highlight it
    navigateAndHighlight(
      getActivityHighlightType(activity.activity_type),
      activity.content_id,
      navigate,
      true
    );
  };
  
  // If the activity is deleted, don't render it at all
  if (isDeleted) {
    return null;
  }
  
  return (
    <div className="mb-3">
      <div 
        className="relative flex items-center py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer bg-white"
        style={{
          borderLeft: `4px solid ${activityColor}`
        }}
        onClick={handleItemClick}
      >
        {/* Profile avatar with hover tooltip showing name */}
        <ActivityAvatar 
          avatarUrl={activity.profiles.avatar_url}
          displayName={activity.profiles.display_name}
        />

        {/* Time elapsed */}
        <span className="text-sm text-gray-500 mr-3 min-w-12 font-medium">
          {timeAgo}
        </span>

        {/* Activity title with icon inline */}
        <ActivityTitle 
          title={activity.title}
          activityType={activity.activity_type}
        />

        {/* Activity action badge - now with more detailed information */}
        <ActivityBadge 
          activityType={activity.activity_type}
          action={action} 
          title={activity.title}
          metadata={activity.metadata}
        />
      </div>
    </div>
  );
};

export default ActivityItem;
