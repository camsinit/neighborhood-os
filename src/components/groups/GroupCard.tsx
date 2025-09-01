import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Lock, Globe, Calendar, User } from 'lucide-react';
import { Group } from '@/types/groups';
import { useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
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
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(group);
  };

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await joinGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await leaveGroupMutation.mutateAsync(group.id);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const isUserMember = group.current_user_membership !== undefined;

  const getGroupTypeIcon = () => {
    return group.group_type === 'physical' ? (
      <MapPin className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
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
        "overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer",
        "border border-gray-200 hover:border-gray-300 bg-white",
        "group hover:scale-[1.02]",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getGroupTypeIcon()}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {getGroupTypeLabel()}
                </span>
                <div className="flex-shrink-0">
                  {group.is_private ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">
                {group.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-gray-600 leading-relaxed line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Stats Section */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center gap-6">
              {/* Member Count */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{group.member_count || 0}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    {(group.member_count || 0) === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>

              {/* Created Date - Only for Physical Groups */}
              {group.group_type === 'physical' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm text-gray-700 ml-1 font-medium">
                      {formatDate(group.created_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          {group.created_by_profile && (
            <div className="flex items-center gap-3 py-3 border-t border-gray-100">
              <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                <AvatarImage src={group.created_by_profile.avatar_url || ''} />
                <AvatarFallback className="text-sm bg-gray-200">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm text-gray-500">Created by</span>
                <span className="text-sm text-gray-900 ml-1 font-medium">
                  {group.created_by_profile.display_name}
                </span>
              </div>
            </div>
          )}

          {/* Join/Leave Actions */}
          {showJoinButton && currentUserId && (
            <div className="pt-4">
              {!isUserMember ? (
                <Button
                  size="lg"
                  variant="default"
                  onClick={handleJoinGroup}
                  disabled={joinGroupMutation.isPending}
                  className="w-full hover:opacity-90 font-semibold py-3 text-white"
                  style={{ 
                    backgroundColor: 'hsl(258, 90%, 66%)',
                    borderColor: 'hsl(258, 90%, 66%)'
                  }}
                >
                  {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">
                        You're a {group.current_user_membership?.role}
                      </span>
                    </div>
                    <span className="text-xs text-green-600">
                      Joined {formatDate(group.current_user_membership?.joined_at || '')}
                    </span>
                  </div>
                  
                  {group.current_user_membership?.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLeaveGroup}
                      disabled={leaveGroupMutation.isPending}
                      className="w-full border-gray-300 hover:border-red-300 hover:text-red-600"
                    >
                      {leaveGroupMutation.isPending ? 'Leaving...' : 'Leave Group'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;