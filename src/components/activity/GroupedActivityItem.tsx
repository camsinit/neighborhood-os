
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
 * Small helper to extract a friendly "first name" from a display name
 * - If the display name has spaces, we take the first segment (e.g., "Jane Doe" -> "Jane")
 * - If it's a single word or handle, we strip a leading "@" and return that word
 * - If empty/undefined, we fall back to "Neighbor"
 */
const extractFirstName = (displayName?: string | null): string => {
  // Defensive: normalize to a trimmed string or empty string
  const name = (displayName ?? '').trim();
  if (!name) return 'Neighbor';
  // Remove a leading @ like @jane_doe
  const cleaned = name.replace(/^@/, '');
  // Split by whitespace and take the first non-empty part
  const first = cleaned.split(/\s+/)[0];
  return first || 'Neighbor';
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
  
  // Derive a first name from the full display name for activity text/UI
  const fullName = primaryActivity.profiles.display_name || 'Neighbor';
  const firstName = extractFirstName(fullName);
  
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
              {/* Show first name in the tooltip to keep activity UI consistent and privacy-friendly */}
              <p>{firstName}</p>
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
          <p className="text-base font-medium text-foreground truncate">
            {/* Use only the first name for activity text; keeps feed concise and respects privacy */}
            {firstName} {groupText}
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
            View {group.count} {primaryActivity.activity_type.includes('skill') ? 'Skills' : 'Items'}
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
