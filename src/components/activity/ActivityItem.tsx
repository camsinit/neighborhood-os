
import React from "react";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, Trash2 } from "lucide-react";
import { Activity } from "@/hooks/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getActivityIcon, getActivityColor } from "./utils/activityHelpers";
import { getModuleThemeColor } from "@/theme/moduleTheme";
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
 * Updated to support group events with special labeling
 */
const getActivityBadgeLabel = (activityType: string, metadata?: any): string => {
  switch (activityType) {
    // Event activities - check if it's a group event
    case 'event_created':
      // If the event has group_id in metadata, it's a group event
      return metadata?.group_id ? 'New Group Event' : 'New Event';
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
  
  // Get activity styling with special handling for group events
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type, activity.metadata);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  
  // Check if this is a group event for special handling
  const isGroupEvent = activity.activity_type === 'event_created' && activity.metadata?.group_id;
  
  // Check if the content has been deleted
  const isDeleted = activity.metadata?.deleted === true;

  /**
   * Handle click on activity item - uses unified navigation service
   * Special handling for group events to navigate to calendar side panel
   */
  const handleItemClick = async () => {
    logger.info('Activity item clicked', { 
      activityType: activity.activity_type, 
      contentId: activity.content_id,
      neighborhoodId: activity.neighborhood_id,
      isDeleted: isDeleted,
      isGroupEvent: isGroupEvent
    });
    
    if (isDeleted) {
      logger.info('Content is deleted, showing action dialog');
      // For deleted content, show the action dialog
      onAction(activity);
      return;
    }
    
    // Special handling for group events - navigate to calendar side panel
    if (isGroupEvent) {
      logger.info('Group event detected, navigating to calendar with side panel');
      try {
        // Navigate to calendar page and highlight the event
        const result = await navigationService.navigateToItem(
          'event', 
          activity.content_id, 
          { showToast: true },
          activity.neighborhood_id
        );
        
        logger.info('Group event navigation result:', result);
        
        if (!result.success) {
          logger.error('Group event navigation failed', result.error as any);
        }
      } catch (error) {
        logger.error('Error navigating to group event', error as any);
      }
      return;
    }
    
    // Regular event handling
    const itemType = getHighlightableType(activity.activity_type);
    logger.info('Mapped to highlight type:', itemType);
    
    try {
      logger.info('Calling navigationService.navigateToItem with:', {
        itemType,
        contentId: activity.content_id,
        neighborhoodId: activity.neighborhood_id
      });
      
      // Pass the neighborhood_id from the activity to ensure proper navigation context
      const result = await navigationService.navigateToItem(
        itemType, 
        activity.content_id, 
        { showToast: true },
        activity.neighborhood_id // Provide neighborhood context from activity data
      );
      
      logger.info('Navigation result:', result);
      
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
    <Card 
      className="relative p-3 transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 group bg-white mb-3"
      style={{
        borderLeftColor: activityColor
      }}
      onClick={handleItemClick}
      {...dataAttributes} // Apply data attributes for highlighting
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the activity item click
                  navigate(`/n/${activity.neighborhood_id}/neighbors`);
                }}
              >
                <Avatar className="h-8 w-8 flex-shrink-0 hover:ring-2 hover:ring-primary/20 transition-all">
                  <AvatarImage src={activity.profiles.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>Click to view {activity.profiles.display_name || "Neighbor"}&apos;s profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Time/Badge */}
          <div className="flex justify-between items-start gap-2">
            <div className="text-sm leading-tight flex-1 font-medium">
              {/* Activity title with icon inline - special handling for group events */}
              <div className="flex items-center">
                {IconComponent && (
                  <IconComponent 
                    className="h-4 w-4 mr-2 flex-shrink-0" 
                    style={{ 
                      // Group events use blue calendar icon, but purple border/badge
                      color: isGroupEvent ? getModuleThemeColor('calendar', 'primary') : activityColor 
                    }} 
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate">
                      {/* Display name in color + action + content title */}
                      <span style={{ color: activityColor, fontWeight: '600' }}>
                        {activity.profiles.display_name || 'A neighbor'}
                      </span>
                      {' '}
                      <span className="text-gray-700">
                        {/* Convert activity type to readable action */}
                        {activity.activity_type === 'event_created' 
                          ? (isGroupEvent ? 'created group event' : 'created event') 
                          : activity.activity_type === 'event_rsvp'
                          ? 'RSVP\'d to'
                          : activity.activity_type === 'skill_offered'
                          ? 'offered skill'
                          : activity.activity_type === 'skill_requested'
                          ? 'requested skill'
                          : activity.activity_type === 'good_shared'
                          ? 'shared item'
                          : activity.activity_type === 'good_requested'
                          ? 'requested item'
                          : activity.activity_type === 'safety_update'
                          ? 'posted safety update'
                          : activity.activity_type === 'neighbor_joined'
                          ? 'joined the neighborhood!'
                          : activity.activity_type === 'profile_updated'
                          ? 'updated profile'
                          : 'updated'
                        }
                      </span>
                      {/* Only show content title for activities that have specific content (not neighbor_joined) */}
                      {activity.activity_type !== 'neighbor_joined' && (
                        <>
                          {' '}
                          <span style={{ color: activityColor, fontWeight: '600' }}>
                            {/* Extract just the content title from metadata or use a clean version */}
                            {activity.metadata?.title || 
                             (activity.title?.includes('created') ? 
                               activity.title.split(' created ')[1] || activity.title.split(' shared ')[1] || activity.title.split(' offered ')[1] || activity.title.split(' requested ')[1] ||
                               activity.title.split(' posted ')[1] || activity.title.split(' updated ')[1] || activity.title.split('RSVP\'d to ')[1] :
                               activity.title)}
                          </span>
                        </>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white max-w-xs">
                    <p>{activity.profiles.display_name} - {activity.title}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Time display */}
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

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
    </Card>
  );
};

export default ActivityItem;
