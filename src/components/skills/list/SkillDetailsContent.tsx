
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { SkillWithProfile } from '../types/skillTypes';

/**
 * SkillDetailsContent - Content displayed in the skill detail dialog
 * 
 * This component encapsulates the detailed view of a skill
 * when a user clicks to see more information.
 */
interface SkillDetailsContentProps {
  skill: SkillWithProfile;
  isOwner: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onRequestSkill: () => void;
}

const SkillDetailsContent = ({ 
  skill, 
  isOwner, 
  onDelete, 
  isDeleting,
  onRequestSkill 
}: SkillDetailsContentProps) => {
  return (
    <div className="space-y-6">
      {/* User profile section */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">
            {skill.profiles?.display_name || 'Anonymous'}
          </h4>
          <p className="text-sm text-gray-500">Skill Provider</p>
        </div>
      </div>

      {/* Description section */}
      {skill.description && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">About this skill</h4>
          <p className="text-sm text-gray-600">{skill.description}</p>
        </div>
      )}

      {/* Availability section */}
      {skill.availability && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Availability</h4>
          <p className="text-sm text-gray-600">{skill.availability}</p>
        </div>
      )}

      {/* Time preferences section */}
      {skill.time_preferences && skill.time_preferences.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Preferred Times</h4>
          <div className="flex flex-wrap gap-2">
            {skill.time_preferences.map((time, index) => (
              <span key={index} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - different for owner vs other users */}
      {!isOwner ? (
        <Button 
          className="w-full"
          onClick={onRequestSkill}
        >
          Request this Skill
        </Button>
      ) : (
        <Button 
          variant="destructive"
          className="w-full"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete this Skill'}
        </Button>
      )}
    </div>
  );
};

export default SkillDetailsContent;
