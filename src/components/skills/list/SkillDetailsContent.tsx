
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SkillWithProfile } from '../types/skillTypes';

/**
 * SkillDetailsContent - Displays detailed skill information in a dialog
 * 
 * This component shows all the skill details including description,
 * category, and provides action buttons for skill owners.
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
    <div className="space-y-4">
      {/* Skill category badge */}
      <div className="flex justify-between items-start">
        <Badge variant="secondary">
          {skill.skill_category.charAt(0).toUpperCase() + skill.skill_category.slice(1)}
        </Badge>
      </div>

      {/* Skill description */}
      {skill.description && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {skill.description}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-4">
        {!isOwner && (
          <Button 
            onClick={onRequestSkill}
            className="flex-1"
          >
            Express Interest
          </Button>
        )}
        
        {isOwner && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Skill'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillDetailsContent;
