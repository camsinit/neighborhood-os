import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Lock, Globe, Calendar, User } from 'lucide-react';
import { Group, GroupMember } from '@/types/groups';
import { cn } from '@/lib/utils';
import { GroupService } from '@/services/groupService';

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
  // State to hold member avatars for the profile stack
  const [memberAvatars, setMemberAvatars] = useState<GroupMember[]>([]);
  const groupService = new GroupService();

  // Fetch group members to display profile images
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await groupService.getGroupMembers(group.id);
        // Only show first 4 members for the profile stack
        setMemberAvatars(members.slice(0, 4));
      } catch (error) {
        console.error('Error fetching group members:', error);
      }
    };

    fetchMembers();
  }, [group.id]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(group);
  };

  // Function to render overlapping profile images
  const renderMemberStack = () => {
    if (memberAvatars.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {/* Profile stack - overlapping avatars */}
        <div className="flex -space-x-2">
          {memberAvatars.map((member, index) => (
            <Avatar 
              key={member.id} 
              className="h-8 w-8 border-2 border-white ring-1 ring-gray-100"
              style={{ zIndex: memberAvatars.length - index }}
            >
              <AvatarImage src={member.profile?.avatar_url || ''} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {member.profile?.display_name?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        {/* Member count text */}
        <span className="text-sm font-medium text-gray-600 ml-1">
          {group.member_count || 0} {group.member_count === 1 ? 'Member' : 'Members'}
        </span>
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer",
        "bg-white border border-gray-200 hover:border-gray-300 rounded-lg",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Cover Photo Section */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/40 overflow-hidden">
        {group.banner_image_url ? (
          <img 
            src={group.banner_image_url} 
            alt={`${group.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          // Default gradient background with subtle pattern
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
            <div className="text-primary/60">
              {group.group_type === 'physical' ? (
                <MapPin className="h-12 w-12" />
              ) : (
                <Users className="h-12 w-12" />
              )}
            </div>
          </div>
        )}
        
        {/* Privacy indicator overlay */}
        <div className="absolute top-3 right-3">
          {group.is_private ? (
            <div className="bg-black/20 backdrop-blur-sm rounded-full p-1.5">
              <Lock className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="bg-black/20 backdrop-blur-sm rounded-full p-1.5">
              <Globe className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Separating stroke */}
      <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
          {group.name}
        </h3>
        
        {/* Description - truncated to 1 line */}
        {group.description && (
          <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* Member Profile Stack */}
        <div className="pt-1">
          {renderMemberStack()}
        </div>

        {/* Join/Learn More Button */}
        {showJoinButton && (
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium"
              onClick={handleCardClick}
            >
              {group.is_private ? 'Request to Join' : 'Join Group'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupCard;