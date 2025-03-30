
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@supabase/auth-helpers-react';
import { formatDistanceToNow } from 'date-fns';
import SkillSessionRequestDialog from '@/components/skills/SkillSessionRequestDialog';
import { SkillWithProfile } from '../types/skillTypes';

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
 * 
 * This component shows all relevant information about a skill offering or request,
 * including the user profile, description, availability, and time preferences.
 * It also provides action buttons appropriate for the current user.
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

  // Format the creation date
  const formattedDate = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : '';

  // Define category colors for visual distinction
  const categoryColors: Record<string, { bg: string; text: string }> = {
    technology: { bg: 'bg-blue-100', text: 'text-blue-800' },
    creativity: { bg: 'bg-purple-100', text: 'text-purple-800' },
    education: { bg: 'bg-green-100', text: 'text-green-800' },
    cooking: { bg: 'bg-orange-100', text: 'text-orange-800' },
    health: { bg: 'bg-red-100', text: 'text-red-800' },
    gardening: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    repair: { bg: 'bg-amber-100', text: 'text-amber-800' },
    other: { bg: 'bg-gray-100', text: 'text-gray-800' },
    creative: { bg: 'bg-purple-100', text: 'text-purple-800' },
    trade: { bg: 'bg-amber-100', text: 'text-amber-800' },
    wellness: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Get the appropriate color scheme for the category
  const { bg, text } = categoryColors[category as keyof typeof categoryColors] || 
    categoryColors.other;

  // Fallback display name and avatar handling for better UX
  const displayName = profileData?.display_name || 'Neighbor';
  const avatarUrl = profileData?.avatar_url || null;
  const providerId = profileData?.id || '';

  return (
    <div className="space-y-6 p-1">
      {/* Header with title and category */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className={`${bg} ${text} border-none`}>
              {category}
            </Badge>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* User profile information */}
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
      {isOwnSkill && props.onDelete ? (
        <div className="pt-4">
          <Button 
            onClick={props.onDelete}
            variant="destructive"
            disabled={props.isDeleting}
            className="w-full"
          >
            {props.isDeleting ? 'Deleting...' : 'Delete Skill'}
          </Button>
        </div>
      ) : !isOwnSkill && (
        <div className="pt-4">
          <Button 
            onClick={() => props.onRequestSkill ? props.onRequestSkill() : setShowRequestDialog(true)} 
            className="w-full"
          >
            {isRequest ? 'Offer to Help' : 'Request to Learn'}
          </Button>
        </div>
      )}

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
