/**
 * Physical Unit Activity Card Component
 * 
 * Individual timeline card for displaying unit activities with:
 * - Color-coded icons (blue for events, purple for updates, green for residents)
 * - Consistent layout matching social group cards
 * - Click handling for detail views
 */

import React from 'react';
import { PhysicalUnitActivityItem } from '@/types/physicalUnitActivityTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Clock, MapPin, Star, UserPlus, UserMinus } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface PhysicalUnitActivityCardProps {
  activity: PhysicalUnitActivityItem;
  onClick?: () => void;
}

export const PhysicalUnitActivityCard: React.FC<PhysicalUnitActivityCardProps> = ({
  activity,
  onClick
}) => {
  const displayName = activity.profiles?.display_name || 'Unknown User';
  const avatarUrl = activity.profiles?.avatar_url;

  // Determine icon and colors based on activity type
  const getActivityStyle = () => {
    switch (activity.type) {
      case 'unit_event':
        return {
          icon: <Calendar className="w-5 h-5" />,
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-blue-100 text-blue-600',
          badgeColor: 'text-blue-600 border-blue-200'
        };
      case 'unit_start':
        return {
          icon: <Star className="w-5 h-5" />,
          borderColor: 'border-l-purple-500',
          bgColor: 'bg-purple-100 text-purple-600',
          badgeColor: 'text-purple-600 border-purple-200'
        };
      case 'resident_joined':
        return {
          icon: <UserPlus className="w-5 h-5" />,
          borderColor: 'border-l-green-500',
          bgColor: 'bg-green-100 text-green-600',
          badgeColor: 'text-green-600 border-green-200'
        };
      case 'resident_left':
        return {
          icon: <UserMinus className="w-5 h-5" />,
          borderColor: 'border-l-orange-500',
          bgColor: 'bg-orange-100 text-orange-600',
          badgeColor: 'text-orange-600 border-orange-200'
        };
      default: // unit_update
        return {
          icon: <MessageSquare className="w-5 h-5" />,
          borderColor: 'border-l-purple-500',
          bgColor: 'bg-purple-100 text-purple-600',
          badgeColor: 'text-purple-600 border-purple-200'
        };
    }
  };

  const { icon, borderColor, bgColor, badgeColor } = getActivityStyle();

  // Get badge text based on activity type
  const getBadgeText = () => {
    switch (activity.type) {
      case 'unit_event':
        return 'Event';
      case 'unit_start':
        return 'Unit Start';
      case 'resident_joined':
        return 'Joined';
      case 'resident_left':
        return 'Left';
      default:
        return 'Update';
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
        activity.type === 'unit_start' ? '' : 'cursor-pointer hover:bg-muted/50'
      } ${borderColor} border-l-4`}
      onClick={activity.type === 'unit_start' ? undefined : onClick}
    >
      {/* Timeline icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
        {icon}
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
            <Badge variant="outline" className={`text-xs ${badgeColor}`}>
              {getBadgeText()}
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
        {activity.type === 'unit_event' && activity.event && (
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
        {activity.type === 'unit_update' && activity.update && (
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

        {/* Resident activity details */}
        {(activity.type === 'resident_joined' || activity.type === 'resident_left') && activity.resident && (
          <p className="text-xs text-muted-foreground">
            {activity.type === 'resident_joined' ? 'Moved in to' : 'Moved out from'} this unit
          </p>
        )}
      </div>
    </div>
  );
};