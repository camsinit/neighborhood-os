
/**
 * Component for displaying an activity badge
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getActivityBadgeLabel } from "./utils/activityLabels";
import { getActivityColor } from "./utils/activityHelpers";

interface ActivityBadgeProps {
  activityType: string;
}

/**
 * Component that displays a styled badge indicating the activity type
 */
const ActivityBadge: React.FC<ActivityBadgeProps> = ({ activityType }) => {
  const activityColor = getActivityColor(activityType);
  
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
      {getActivityBadgeLabel(activityType)}
    </Badge>
  );
};

export default ActivityBadge;
