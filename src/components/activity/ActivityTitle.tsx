
/**
 * Component for displaying an activity title with an icon
 */
import React from "react";
import { getActivityIcon, getActivityColor } from "./utils/activityHelpers";

interface ActivityTitleProps {
  title: string;
  activityType: string;
}

/**
 * Component that displays an activity title with its corresponding icon
 */
const ActivityTitle: React.FC<ActivityTitleProps> = ({ title, activityType }) => {
  // Get the appropriate icon component based on activity type
  const IconComponent = getActivityIcon(activityType);
  const activityColor = getActivityColor(activityType);
  
  return (
    <div className="flex items-center flex-1 min-w-0">
      {IconComponent && (
        <IconComponent 
          className="h-4.5 w-4.5 mr-2 flex-shrink-0" 
          style={{ color: activityColor }} 
        />
      )}
      <p className="text-base font-medium text-gray-900 truncate">
        {title}
      </p>
    </div>
  );
};

export default ActivityTitle;
