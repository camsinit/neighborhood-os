import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Lock, Globe, Calendar, User } from 'lucide-react';
import { Group } from '@/types/groups';
// Removed join/leave imports - handled in GroupProfileDialog now
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface GroupCardProps {
  group: Group;
  className?: string;
  onClick?: (group: Group) => void;
  showJoinButton?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  className,
  onClick,
  showJoinButton = false
}) => {
  // Removed mutation hooks and user state - handled in GroupProfileDialog now

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(group);
  };

  // Removed join/leave handlers - these are now handled in the GroupProfileDialog

  // Removed membership check - handled in GroupProfileDialog now

  const getGroupTypeIcon = () => {
    return group.group_type === 'physical' ? (
      <MapPin className="h-4 w-4" />
    ) : (
      null
    );
  };

  const getGroupTypeLabel = () => {
    if (group.group_type === 'physical') {
      return group.physical_unit_value || 'Physical Group';
    }
    return 'Social Group';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer",
        "border border-gray-200 hover:border-gray-300",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate text-gray-900">
                {group.name}
              </h3>
              
              {/* Group Type Badge */}
              {getGroupTypeIcon()}
            </div>

            {/* Privacy Icon */}
            <div className="flex-shrink-0 ml-2">
              {group.is_private ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {/* Member Count */}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{group.member_count || 0} members</span>
              </div>

              {/* Created Date - Only show for Physical Groups */}
              {group.group_type === 'physical' && (
                <>
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(group.created_at)}</span>
                </>
              )}
            </div>
          </div>

          {/* Creator Info */}
          {group.created_by_profile && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Avatar className="h-6 w-6">
                <AvatarImage src={group.created_by_profile.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">
                Created by {group.created_by_profile.display_name}
              </span>
            </div>
          )}

          {/* Learn More Action */}
          {showJoinButton && (
            <div className="pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCardClick}
                className="w-full"
              >
                Learn More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;