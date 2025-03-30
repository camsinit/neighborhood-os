
/**
 * User profile section for skill details
 */
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * Props for UserProfileSection
 */
interface UserProfileSectionProps {
  displayName: string;
  avatarUrl: string | null;
  isRequest: boolean;
}

/**
 * Component to display user profile information in skill details
 * Shows avatar, name, and role (offering help or needing help)
 * 
 * @param displayName - The user's display name
 * @param avatarUrl - URL to the user's avatar image (if available)
 * @param isRequest - Whether this is a skill request (true) or skill offer (false)
 */
const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  displayName,
  avatarUrl,
  isRequest
}) => {
  // Generate the fallback avatar text (first letter of display name)
  const fallbackText = displayName ? displayName[0].toUpperCase() : '?';
  
  // Determine the role text based on whether this is a request or offer
  const roleText = isRequest ? 'Needs help with this' : 'Offering to help';

  return (
    <div className="flex items-center gap-3">
      {/* User avatar with image or fallback letter */}
      <Avatar className="h-10 w-10">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback>{fallbackText}</AvatarFallback>
        )}
      </Avatar>
      
      {/* User name and role information */}
      <div>
        <p className="font-medium text-gray-900">{displayName}</p>
        <p className="text-sm text-gray-500">{roleText}</p>
      </div>
    </div>
  );
};

export default UserProfileSection;
