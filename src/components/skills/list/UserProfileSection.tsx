
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
 */
const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  displayName,
  avatarUrl,
  isRequest
}) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="font-medium text-gray-900">{displayName}</p>
        <p className="text-sm text-gray-500">
          {isRequest ? 'Needs help with this' : 'Offering to help'}
        </p>
      </div>
    </div>
  );
};

export default UserProfileSection;
