
import React from "react";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { User, X } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";

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
      
    default:
      return 'Update';
  }
};

/**
 * Map activity types to highlightable item types
 */
const getHighlightableType = (activityType: string): HighlightableItemType => {
  // Extract the base type from activity_type (e.g., skill_offered → skills)
  const baseType = activityType.split('_')[0];
  
  // Map to our standard item types
  switch (baseType) {
    case 'skill': return 'skills';
    case 'event': return 'event';
    case 'good': return 'goods';
    case 'safety': return 'safety';
    default: return 'event'; // Default fallback
  }
};

/**
 * Component for displaying a single activity item in the feed
 */
const ActivityItem = ({
  activity,
  onAction
}: ActivityItemProps) => {
  const navigate = useNavigate();
  const navigationService = createItemNavigationService(navigate);
  const currentUser = useUser();
  
  const IconComponent = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);
  const timeAgo = getCompactTimeAgo(new Date(activity.created_at));
  
  // Check if the content has been deleted
  const isDeleted = activity.metadata?.deleted === true;
  
  // Check if user can delete this activity (created by them and within last hour)
  const canDelete = currentUser?.id === activity.actor_id && 
    differenceInHours(new Date(), new Date(activity.created_at)) <= 1;

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
      const result = await navigationService.navigateToItem(
        itemType, 
        activity.content_id, 
        { showToast: true }
      );
      
      if (!result.success) {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Error navigating from activity item:', error);
    }
  };

  /**
   * Handle delete activity - marks activity as deleted in database
   */
  const handleDeleteActivity = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering item click
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activity.id);
        
      if (error) throw error;
      
      toast.success('Activity removed');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to remove activity');
    }
  };

  // Get the activity type for the badge
  const activityType = getHighlightableType(activity.activity_type);
  
  // Generate data attributes for this activity item
  const dataAttributes = generateDataAttributes(activityType, activity.content_id);
  
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
          <p className="text-base font-medium text-gray-900 truncate">
            {activity.title}
          </p>
        </div>

        {/* Delete button for user's recent activities */}
        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2 opacity-60 hover:opacity-100 text-gray-500 hover:text-red-500"
                onClick={handleDeleteActivity}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove activity</p>
            </TooltipContent>
          </Tooltip>
        )}

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
      </div>
    </div>
  );
};

export default ActivityItem;
