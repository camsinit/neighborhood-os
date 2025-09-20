import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GroupMember } from '@/types/groups';
import { createItemNavigationService } from '@/services/navigation/ItemNavigationService';

interface GroupMembersPopoverProps {
  /**
   * List of group members to display in the popover
   */
  members: GroupMember[];
  /**
   * The trigger element that opens the popover when clicked
   */
  children: React.ReactNode;
  /**
   * Current neighborhood ID for navigation
   */
  neighborhoodId: string;
}

/**
 * Popover component that displays all group members with their profiles and roles
 * 
 * Features:
 * - Shows member avatar, name, and role (Creator/Admin/blank)
 * - Clicking on a member navigates to their neighbor profile
 * - Scrollable list for groups with many members
 * - Proper role display based on group member role
 */
export const GroupMembersPopover: React.FC<GroupMembersPopoverProps> = ({
  members,
  children,
  neighborhoodId
}) => {
  const navigate = useNavigate();
  
  // Create navigation service using the same pattern as ActivityItem
  const navigationService = createItemNavigationService(navigate);

  /**
   * Handle clicking on a group member - navigate to their neighbor profile
   */
  const handleMemberClick = async (member: GroupMember) => {
    // Use ItemNavigationService for consistent navigation behavior
    await navigationService.navigateToItem('neighbors', member.user_id, { showToast: false }, neighborhoodId);
  };

  /**
   * Get the display text for a member's role in the group
   */
  const getRoleDisplayText = (role: GroupMember['role']): string => {
    switch (role) {
      case 'owner':
        return 'Creator';
      case 'moderator':
        return 'Admin';
      case 'member':
      default:
        return ''; // No text for regular members
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">
            Group Members ({members.length})
          </h3>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {members.map((member) => {
              const roleText = getRoleDisplayText(member.role);
              
              return (
                <div
                  key={member.user_id}
                  onClick={() => handleMemberClick(member)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Member avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profile?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {member.profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Member info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.profile?.display_name || 'Unknown User'}
                    </p>
                  </div>
                  
                  {/* Role indicator - only show if not empty */}
                  {roleText && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {roleText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};