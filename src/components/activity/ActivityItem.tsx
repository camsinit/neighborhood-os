
import React from "react";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, Trash2 } from "lucide-react";
import { Activity } from "@/hooks/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityIcon, getActivityColor } from "./utils/activityHelpers";
import { useNavigate } from "react-router-dom";
import { createItemNavigationService } from "@/services/navigation/ItemNavigationService";
import { HighlightableItemType } from "@/utils/highlight/types";
import { generateDataAttributes } from "@/utils/dataAttributes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/utils/logger";
/**
 * Props for the ActivityItem component
 */
interface ActivityItemProps {
  activity: Activity;
  onAction: (activity: Activity) => void;
  debugDeleteMode?: boolean;
  onDelete?: (activityId: string) => void;
}

/**
 * Helper function to format time since activity in a compact way
 */
const getCompactTimeAgo = (date: Date): string => {
  // This function formats the timestamp into a human-readable format
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
 * Get a concise action description for the activity badge
 * This maps activity types to short, action-focused labels
 */
const getActivityBadgeLabel = (activityType: string): string => {
  switch (activityType) {
    // Event activities
    case 'event_created':
      return 'New Event';
    case 'event_rsvp':
      return 'Event RSVP';
      
    // Skill activities
    case 'skill_offered':
      return 'Skill Offered';
    case 'skill_requested':
      return 'Skill Request';
      
    // Goods activities  
    case 'good_shared':
      return 'Item Shared';
    case 'good_requested':
      return 'Item Request';
      
    // Safety activities
    case 'safety_update':
      return 'Safety Update';
      
    // Neighbor activities
    case 'neighbor_joined':
      return 'New Neighbor';
    case 'profile_updated':
      return 'Profile Updated';
      
    default:
      return 'Update';
  }
};

/**
 * Map activity types to highlightable item types
 */
const getHighlightableType = (activityType: string): HighlightableItemType => {
  // Handle neighbor activities specifically
  if (activityType === 'neighbor_joined' || activityType === 'profile_updated') {
    return 'neighbors';
  }
  
  // Extract the base type from activity_type (e.g., skill_offered → skills)
  const baseType = activityType.split('_')[0];
  
  // Map to our standard item types
  switch (baseType) {
    case 'skill': return 'skills';
    case 'event': return 'event';
    case 'good': return 'goods';
    case 'safety': return 'safety';
    case 'group': return 'group'; // Map group activities to group highlight type
    default: return 'event'; // Default fallback
  }
};

/**
 * Component for displaying a single activity item in the feed
 */
const ActivityItem = ({
  activity,
  onAction,
  debugDeleteMode = false,
  onDelete
}: ActivityItemProps) => {
  const navigate = useNavigate();
  const navigationService = createItemNavigationService(navigate);
  // Logger scoped to ActivityItem for clear, filtered logs
  const logger = createLogger('ActivityItem');
  
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  
  // Check if the content has been deleted
  const isDeleted = activity.metadata?.deleted === true;

  /**
   * Handle click on activity item - uses unified navigation service
   */
  const handleItemClick = async () => {
    if (isDeleted) {
      // For deleted content, show the action dialog
      onAction(activity);
      return;
    }
    
    // Get the item type and use unified navigation service
    const itemType = getHighlightableType(activity.activity_type);
    
    try {
      // Pass the neighborhood_id from the activity to ensure proper navigation context
      const result = await navigationService.navigateToItem(
        itemType, 
        activity.content_id, 
        { showToast: true },
        activity.neighborhood_id // Provide neighborhood context from activity data
      );
      
      if (!result.success) {
        logger.error('Navigation failed', result.error as any);
      }
    } catch (error) {
      logger.error('Error navigating from activity item', error as any);
    }
  };

  /**
   * Handle delete button click - prevents event propagation
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the item click
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  // Get the activity type for the badge
  const activityType = getHighlightableType(activity.activity_type);
  
  // Generate data attributes for this activity item
  const dataAttributes = generateDataAttributes(activityType, activity.content_id);
  
  // For neighbor join activities, add a celebratory exclamation mark at the end of the title
  // - We guard against double '!' to keep the UI clean
  const isNeighborJoin = activity.activity_type === 'neighbor_joined';
  const displayTitle = isNeighborJoin
    ? (activity.title?.endsWith('!') ? activity.title : `${activity.title}!`)
    : activity.title;
  
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
        {...dataAttributes} // Apply data attributes for highlighting
      >
        {/* Profile avatar with hover tooltip showing name */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0 mr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.profiles.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>{activity.profiles.display_name || "Neighbor"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Time elapsed */}
        <span className="text-sm text-gray-500 mr-3 min-w-12 font-medium">
          {timeAgo}
        </span>

        {/* Activity title with icon inline */}
        <div className="flex items-center flex-1 min-w-0">
          {IconComponent && (
            <IconComponent 
              className="h-4.5 w-4.5 mr-2 flex-shrink-0" 
              style={{ color: activityColor }} 
            />
          )}
          <p className="text-base font-medium text-foreground truncate">
            {/* Append '!' for neighbor join to add excitement, without changing DB data */}
            {displayTitle}
          </p>
        </div>

        {/* Activity action badge */}
        <Badge 
          variant="outline" 
          className="ml-auto flex-shrink-0 text-sm px-2.5 py-0.5 font-medium" 
          style={{ 
            backgroundColor: `${activityColor}15`,
            color: activityColor,
            borderColor: `${activityColor}30`
          }}
        >
          {getActivityBadgeLabel(activity.activity_type)}
        </Badge>

        {/* Debug delete button - only visible in debug mode */}
        {debugDeleteMode && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="ml-2 p-1 h-6 w-6 min-w-0"
            onClick={handleDeleteClick}
            title="Delete activity (Debug Mode)"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
