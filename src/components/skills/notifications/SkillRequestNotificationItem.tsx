
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillWithProfile } from '../types/skillTypes';

/**
 * Individual skill request item that appears in the popover or drawer
 * 
 * This component renders a single skill request with the requester's avatar and name
 */
interface SkillRequestNotificationItemProps {
  request: SkillWithProfile;
  onClick?: () => void; // Make onClick optional
}

const SkillRequestNotificationItem: React.FC<SkillRequestNotificationItemProps> = ({ 
  request, 
  onClick 
}) => {
  // Only add onClick handler if it's provided
  const handleClick = onClick ? onClick : undefined;
  
  // Render a single request item with consistent styling
  return (
    <div 
      className={`p-3 border-b hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Avatar section shows the requester's profile image */}
        <Avatar className="h-9 w-9">
          <AvatarImage src={request.profiles?.avatar_url || undefined} />
          <AvatarFallback>{request.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        
        {/* Request details section with title and requester name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{request.title}</p>
          <p className="text-xs text-gray-500 truncate">
            From: {request.profiles?.display_name || 'Anonymous'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillRequestNotificationItem;
