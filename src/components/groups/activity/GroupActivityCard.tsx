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
import { Calendar, MessageSquare, Clock, MapPin, Star } from 'lucide-react';
import { formatDate } from '@/utils/date';

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
      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
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
      {/* Timeline icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        activity.type === 'event' 
          ? 'bg-blue-100 text-blue-600' 
          : activity.type === 'group_start'
          ? 'bg-purple-100 text-purple-600'
          : 'bg-purple-100 text-purple-600'
      }`}>
        {activity.type === 'event' ? (
          <Calendar className="w-5 h-5" />
        ) : activity.type === 'group_start' ? (
          <Star className="w-5 h-5" />
        ) : (
          <MessageSquare className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header with user info and timestamp */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>
            <Badge variant="outline" className={`text-xs ${
              activity.type === 'event' ? 'text-blue-600 border-blue-200' : 
              activity.type === 'group_start' ? 'text-purple-600 border-purple-200' :
              'text-purple-600 border-purple-200'
            }`}>
              {activity.type === 'event' ? 'Event' : activity.type === 'group_start' ? 'Group Start' : 'Update'}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(activity.created_at)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-foreground mb-1 truncate">
          {activity.title}
        </h4>

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