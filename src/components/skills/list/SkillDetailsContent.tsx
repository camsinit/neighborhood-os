
/**
 * Component for displaying detailed information about a skill
 */
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@supabase/auth-helpers-react';
import SkillSessionRequestDialog from '@/components/skills/SkillSessionRequestDialog';
import { SkillWithProfile } from '../types/skillTypes';
import SkillDetailsHeader from './SkillDetailsHeader';
import UserProfileSection from './UserProfileSection';
import ActionButtons from './ActionButtons';

/**
 * Props for SkillDetailsContent
 * This component accepts either individual properties or a complete skill object
 */
interface SkillDetailsContentProps {
  // Individual properties approach
  id?: string;
  title?: string;
  description?: string | null;
  category?: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    id: string;
  } | null;
  created_at?: string;
  request_type?: string;
  availability?: string | null;
  time_preferences?: string[] | null;
  onClose?: () => void;
  
  // Alternative: pass the complete skill object
  skill?: SkillWithProfile;
  
  // Actions for owner
  isOwner?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  onRequestSkill?: () => void;
}

/**
 * SkillDetailsContent - Displays detailed information about a skill
 */
const SkillDetailsContent: React.FC<SkillDetailsContentProps> = (props) => {
  // Initialize state for request dialog
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const user = useUser();

  // Extract properties, either from individual props or from skill object
  const id = props.skill?.id || props.id || '';
  const title = props.skill?.title || props.title || '';
  const description = props.skill?.description || props.description;
  const category = props.skill?.skill_category || props.category || 'other';
  
  // Handle profiles data - ensure it's properly typed
  let profileData: { display_name: string | null; avatar_url: string | null; id: string } | null = null;
  
  if (props.skill?.profiles) {
    // If we have a skill object with profiles
    profileData = props.skill.profiles as { display_name: string | null; avatar_url: string | null; id: string };
  } else if (props.profiles) {
    // If we have profiles from individual props
    profileData = props.profiles;
  }
  
  const created_at = props.skill?.created_at || props.created_at || '';
  const request_type = props.skill?.request_type || props.request_type || '';
  const availability = props.skill?.availability || props.availability;
  const time_preferences = props.skill?.time_preferences || props.time_preferences;
  
  // Determine if the current user is the owner
  const isOwnSkill = props.isOwner !== undefined 
    ? props.isOwner 
    : (user?.id === profileData?.id);
  const isRequest = request_type === 'need';

  // Fallback display name and avatar handling for better UX
  const displayName = profileData?.display_name || 'Neighbor';
  const avatarUrl = profileData?.avatar_url || null;
  const providerId = profileData?.id || '';

  // Handle the request skill action
  const handleRequestSkill = () => {
    if (props.onRequestSkill) {
      props.onRequestSkill();
    } else {
      setShowRequestDialog(true);
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header with title and category */}
      <SkillDetailsHeader 
        title={title} 
        category={category} 
        created_at={created_at} 
      />

      {/* User profile information */}
      <UserProfileSection 
        displayName={displayName} 
        avatarUrl={avatarUrl} 
        isRequest={isRequest} 
      />

      {/* Description section */}
      {description && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Description</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* Availability section */}
      {availability && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <p className="text-gray-600 text-sm">{availability}</p>
        </div>
      )}

      {/* Time preferences section */}
      {time_preferences && time_preferences.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Time Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {time_preferences.map((time, i) => (
              <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 border-none">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <ActionButtons 
        isOwner={isOwnSkill}
        isRequest={isRequest}
        onDelete={props.onDelete}
        onRequestSkill={handleRequestSkill}
        isDeleting={props.isDeleting}
      />

      {/* Request dialog */}
      <SkillSessionRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        skillId={id}
        skillTitle={title}
        providerId={providerId}
      />
    </div>
  );
};

export default SkillDetailsContent;
