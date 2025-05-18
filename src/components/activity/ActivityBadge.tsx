
/**
 * Component for displaying an activity badge with detailed action information
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getActivityBadgeLabel, getDetailedActivityLabel } from "./utils/activityLabels";
import { getActivityColor } from "./utils/activityHelpers";

interface ActivityBadgeProps {
  // The activity type (event, safety, skills, etc.)
  activityType: string;
  // Optional action that specifies what happened with this activity
  action?: string;
}

/**
 * Component that displays a styled badge indicating the specific activity action
 * The badge shows a more detailed description of what happened rather than just the activity type
 */
const ActivityBadge: React.FC<ActivityBadgeProps> = ({ activityType, action }) => {
  // Get the appropriate color for this activity type
  const activityColor = getActivityColor(activityType);
  
  // Get the detailed label based on both activity type and action
  const badgeLabel = getDetailedActivityLabel(activityType, action);
  
  return (
    <Badge 
      variant="outline" 
      className="ml-auto flex-shrink-0 text-sm px-2.5 py-0.5 font-medium" 
      style={{ 
        backgroundColor: `${activityColor}15`,
        color: activityColor,
        borderColor: `${activityColor}30`
      }}
    >
      {badgeLabel}
    </Badge>
  );
};

export default ActivityBadge;
