import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User, MapPin, Clock, Shield, Globe } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Interface for group overview card props
 */
interface GroupOverviewCardProps {
  data: any; // Group data with profile and member information
  neighborhoodData: any; // Neighborhood context data
  onActionClick: () => void; // Action button handler
  actionButtonText: string; // Text for the action button
}

/**
 * GroupOverviewCard - Public overview of a shared group
 * 
 * This component displays group information in a public context
 * without requiring authentication. It shows:
 * - Group creator profile image and name
 * - Group name, privacy status, and member count
 * - Group description and category
 * - Member avatars preview
 * - Neighborhood context
 * - Action button (join or view in dashboard)
 */
const GroupOverviewCard: React.FC<GroupOverviewCardProps> = ({
  data: group,
  neighborhoodData,
  onActionClick,
  actionButtonText
}) => {
  // Format the group creation date for display
  const createdDate = parseISO(group.created_at);
  const formattedDate = format(createdDate, 'MMMM yyyy');

  // Get member count and first few member avatars for preview
  const memberCount = group.group_members?.length || 0;
  const memberAvatars = group.group_members?.slice(0, 5) || [];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        {/* Group creator profile section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={group.profiles?.avatar_url} 
              alt={group.profiles?.display_name || 'Group Creator'} 
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Group created by</p>
            <p className="font-medium text-gray-900">
              {group.profiles?.display_name || 'A neighbor'}
            </p>
          </div>
        </div>

        {/* Group name and privacy status */}
        <div className="flex items-center gap-2 mb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {group.name}
          </CardTitle>
          {group.is_private ? (
            <Shield className="h-5 w-5 text-gray-500" />
          ) : (
            <Globe className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Group details */}
        <div className="space-y-3">
          {/* Member count and avatars */}
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </p>
              {memberAvatars.length > 0 && (
                <div className="flex -space-x-2 mt-2">
                  {memberAvatars.map((member, index) => (
                    <Avatar key={member.id || index} className="h-8 w-8 border-2 border-white">
                      <AvatarImage 
                        src={member.profiles?.avatar_url} 
                        alt={member.profiles?.display_name || 'Member'} 
                      />
                      <AvatarFallback className="text-xs">
                        {member.profiles?.display_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {memberCount > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                      +{memberCount - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Group creation date */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Created</p>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Group location/neighborhood */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{neighborhoodData?.name || 'Neighborhood'}</p>
            </div>
          </div>
        </div>

        {/* Group description */}
        {group.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">About this group</h4>
            <p className="text-gray-600 leading-relaxed">{group.description}</p>
          </div>
        )}

        {/* Group badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Group
          </Badge>
          {neighborhoodData && (
            <Badge variant="outline">
              {neighborhoodData.name}
            </Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {group.is_private ? 'Private' : 'Public'}
          </Badge>
          {group.group_type && (
            <Badge variant="outline" className="capitalize">
              {group.group_type.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Action button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onActionClick}
            className="w-full"
            size="lg"
          >
            {actionButtonText}
          </Button>
        </div>

        {/* Footer information */}
        <div className="text-center text-sm text-gray-500">
          <p>This group was shared from the {neighborhoodData?.name || 'neighborhood'} community</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupOverviewCard;