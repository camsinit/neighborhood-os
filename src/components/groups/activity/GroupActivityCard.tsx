/**
 * Group Activity Card Component
 * 
 * Individual timeline card for displaying events and updates with:
 * - Color-coded icons (blue for events, purple for updates)
 * - Consistent layout and spacing
 * - Click handling for detail views
 */

import React from 'react';
import { GroupActivityItem } from '@/types/groupActivityTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, MessageSquare, Clock, MapPin, Star } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { formatCompactDate } from '@/utils/compactDate';

interface GroupActivityCardProps {
  activity: GroupActivityItem;
  onClick?: () => void;
}

export const GroupActivityCard: React.FC<GroupActivityCardProps> = ({
  activity,
  onClick
}) => {
  const displayName = activity.profiles?.display_name || 'Unknown User';
  const avatarUrl = activity.profiles?.avatar_url;

  return (
    <div
      className={`relative flex items-start space-x-3 p-3 rounded-lg transition-colors ${
        activity.type === 'group_start' ? '' : 'cursor-pointer hover:bg-muted/50'
      } ${
        activity.type === 'event' ? 'border-l-4 border-l-blue-500' : 
        activity.type === 'group_start' ? 'border-l-4 border-l-purple-500' :
        'border-l-4 border-l-purple-500'
      }`}
      onClick={activity.type === 'group_start' ? undefined : onClick}
      role={activity.type === 'group_start' ? undefined : "button"}
      tabIndex={activity.type === 'group_start' ? undefined : 0}
    >
      {/* Activity type badge positioned in top right */}
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className={`text-xs ${
          activity.type === 'event' ? 'text-blue-600 border-blue-200' : 
          activity.type === 'group_start' ? 'text-purple-600 border-purple-200' :
          'text-purple-600 border-purple-200'
        }`}>
          {activity.type === 'event' ? 'Event' : activity.type === 'group_start' ? 'Group Start' : 'Update'}
        </Badge>
      </div>
      {/* Profile image with timestamp underneath */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="w-10 h-10 hover-scale cursor-help">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{displayName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Compact timestamp positioned under profile photo */}
        <span className="text-xs text-muted-foreground mt-1">
          {formatCompactDate(activity.created_at)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-16">
        {/* Header with just the title */}
        <div className="mb-1">
          <span className="text-sm font-medium text-foreground">
            {activity.title}
          </span>
        </div>

        {/* Event-specific details */}
        {activity.type === 'event' && activity.event && (
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(activity.event.time)}
            </div>
            {activity.event.location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {activity.event.location}
              </div>
            )}
          </div>
        )}

        {/* Update-specific preview */}
        {activity.type === 'update' && activity.update && (
          <div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {activity.update.content.slice(0, 120)}
              {activity.update.content.length > 120 && '...'}
            </p>
            {activity.update.image_urls && activity.update.image_urls.length > 0 && (
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  📷 {activity.update.image_urls.length} image{activity.update.image_urls.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};