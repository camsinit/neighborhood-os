
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { SkillWithProfile } from '../types/skillTypes';

/**
 * SkillOfferCard - The compact card showing an offered skill
 * 
 * This appears in the list of available skills with actions
 * appropriate based on whether you're the owner or not.
 */
interface SkillOfferCardProps {
  skill: SkillWithProfile;
  isOwner: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onRequestSkill: () => void;
  onClick: () => void;
}

const SkillOfferCard = ({ 
  skill, 
  isOwner, 
  onDelete,
  isDeleting, 
  onRequestSkill,
  onClick 
}: SkillOfferCardProps) => {
  // This function handles the delete button click
  // We stop event propagation to prevent the card onClick from firing
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  // This function handles the request button click
  // Again, we stop propagation to prevent the card onClick
  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestSkill();
  };

  return (
    <div 
      data-skill-id={skill.id}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
      onClick={onClick}
    >
      {/* User profile and skill title */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <h4 className="font-medium text-gray-900">{skill.title}</h4>
      </div>
      
      {/* Action button */}
      {isOwner ? (
        <Button 
          variant="destructive" 
          size="icon"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="ml-4 h-9 w-9"
          aria-label="Delete skill"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          onClick={handleRequestClick}
          className="ml-4"
        >
          Request Skill
        </Button>
      )}
    </div>
  );
};

export default SkillOfferCard;
