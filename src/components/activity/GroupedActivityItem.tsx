
import React from "react";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
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
  
  // For grouped activities, use full name to match other activity items format
  // For single activities, continue using first name for privacy
  const displayName = group.type === 'grouped' ? fullName : firstName;
  
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
    <Card 
      className="relative p-3 transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 group bg-white mb-3"
      style={{
        borderLeftColor: activityColor
      }}
      onClick={handleItemClick}
      {...dataAttributes}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={primaryActivity.profiles.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>{displayName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Time/Badge */}
          <div className="flex justify-between items-start gap-2">
            <div className="text-sm leading-tight flex-1 font-medium">
              {/* Activity title with icon inline */}
              <div className="flex items-center min-h-[2rem]">
                {IconComponent && (
                  <IconComponent 
                    className="h-4 w-4 mr-2 flex-shrink-0" 
                    style={{ color: activityColor }} 
                  />
                )}
                <span className="break-words leading-relaxed">
                  {/* Display name in color + action description */}
                  <span style={{ color: activityColor, fontWeight: '600' }}>
                    {displayName}
                  </span>
                  {' '}
                  <span className="text-gray-700">
                    {groupText}
                  </span>
                </span>
              </div>
            </div>
            
            {/* Time and count badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                {timeAgo}
              </span>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 font-medium" 
                style={{ 
                  backgroundColor: `${activityColor}15`,
                  color: activityColor,
                  borderColor: `${activityColor}30`
                }}
              >
                View {group.count}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GroupedActivityItem;
