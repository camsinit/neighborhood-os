
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Using useNavigate instead of useRouter
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NotificationsPopover } from '../NotificationsPopover'; // Correct import
import { highlightItem } from '@/utils/highlight';
import { HighlightableItemType } from '@/utils/highlight/types';

// Interface for the skill notification props
interface SkillNotificationItemProps {
  id: string;
  title: string;
  userName: string;
  userAvatar?: string;
  userInitials?: string;
  timestamp: string;
  skillId: string;
  isRead?: boolean;
  onAction?: () => void;
}

/**
 * Component to display a skill notification item
 * Now with improved error handling and better type safety
 */
const SkillNotificationItem: React.FC<SkillNotificationItemProps> = ({
  id,
  title,
  userName,
  userAvatar,
  userInitials = '?',
  timestamp,
  skillId,
  isRead = false,
  onAction
}) => {
  // Use navigate instead of useRouter
  const navigate = useNavigate();
  
  // Handle view skill action with error prevention
  const handleViewSkill = () => {
    try {
      // Navigate to the skill details and highlight it
      navigate(`/skills?highlight=${skillId}`);
      
      // Optional: Highlight the skill item when user navigates there
      highlightItem({
        id: skillId,
        type: 'skill' as HighlightableItemType
      });
      
      // Call the parent's action handler if provided
      if (onAction) onAction();
    } catch (error) {
      console.error('Error navigating to skill:', error);
    }
  };
  
  return (
    <NotificationsPopover 
      onAction={handleViewSkill}
      itemId={id}
      type="skill"
      title={title} // Add title prop here which was missing
      actionLabel="View Skill"
      contentId={skillId}
      contentType="skill"
    >
      <div className={`p-3 rounded-lg border mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${!isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Avatar section */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          
          {/* Content section */}
          <div className="flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-gray-500">{userName} • {timestamp}</p>
          </div>
          
          {/* Action button */}
          <Button size="sm" variant="ghost" onClick={handleViewSkill} className="text-xs h-7">
            View
          </Button>
        </div>
      </div>
    </NotificationsPopover>
  );
};

export default SkillNotificationItem;
