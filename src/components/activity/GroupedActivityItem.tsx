
import React from "react";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityIcon, getActivityColor } from "./utils/activityHelpers";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActivityGroup, getGroupedActivityText } from "@/utils/activityGrouping";
import { generateDataAttributes } from "@/utils/dataAttributes";

/**
 * Props for the GroupedActivityItem component
 */
interface GroupedActivityItemProps {
  group: ActivityGroup;
  onGroupClick: (group: ActivityGroup) => void;
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
 * Component for displaying grouped activity items in the feed
 */
const GroupedActivityItem = ({ group, onGroupClick }: GroupedActivityItemProps) => {
  const { primaryActivity } = group;
  const IconComponent = getActivityIcon(primaryActivity.activity_type);
  const activityColor = getActivityColor(primaryActivity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(primaryActivity.created_at));
  const groupText = getGroupedActivityText(group);
  
  // Generate data attributes for the primary activity
  const activityType = primaryActivity.activity_type.split('_')[0] === 'skill' ? 'skills' : 'event';
  const dataAttributes = generateDataAttributes(activityType, primaryActivity.content_id);

  /**
   * Handle click on grouped activity item
   */
  const handleItemClick = () => {
    onGroupClick(group);
  };

  return (
    <div className="mb-3">
      <div 
        className="relative flex items-center py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer bg-white"
        style={{
          borderLeft: `4px solid ${activityColor}`
        }}
        onClick={handleItemClick}
        {...dataAttributes}
      >
        {/* Profile avatar with hover tooltip showing name */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0 mr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={primaryActivity.profiles.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>{primaryActivity.profiles.display_name || "Neighbor"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Time elapsed */}
        <span className="text-sm text-gray-500 mr-3 min-w-12 font-medium">
          {timeAgo}
        </span>

        {/* Activity description with icon inline */}
        <div className="flex items-center flex-1 min-w-0">
          {IconComponent && (
            <IconComponent 
              className="h-4.5 w-4.5 mr-2 flex-shrink-0" 
              style={{ color: activityColor }} 
            />
          )}
          <p className="text-base font-medium text-gray-900 truncate">
            {groupText.charAt(0).toUpperCase() + groupText.slice(1)}
          </p>
        </div>

        {/* Count badge and arrow */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <Badge 
            variant="outline" 
            className="text-sm px-2.5 py-0.5 font-medium" 
            style={{ 
              backgroundColor: `${activityColor}15`,
              color: activityColor,
              borderColor: `${activityColor}30`
            }}
          >
            {group.count} items
          </Badge>
          <ChevronRight 
            className="h-4 w-4 text-gray-400" 
          />
        </div>
      </div>
    </div>
  );
};

export default GroupedActivityItem;
