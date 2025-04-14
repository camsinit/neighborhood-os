
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SkillWithProfile, SkillCategory } from '../types/skillTypes';

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

// This maps categories to their appropriate colors
const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
  creative: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
  trade: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
  technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
  education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'},
  wellness: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
};

const SkillOfferCard = ({ 
  skill, 
  isOwner, 
  onDelete,
  isDeleting, 
  onRequestSkill,
  onClick 
}: SkillOfferCardProps) => {
  // This function handles the request button click
  // We stop propagation to prevent the card onClick
  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestSkill();
  };

  // Get the category colors from our map, fallback to technology if not found
  const categoryStyle = categoryColors[skill.skill_category] || categoryColors.technology;

  return (
    <div 
      data-skill-id={skill.id}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
      onClick={onClick}
    >
      {/* User profile and skill title */}
      <div className="flex items-center gap-3 flex-grow">
        <Avatar className="h-10 w-10">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h4 className="font-medium text-gray-900">{skill.title}</h4>
          <Badge 
            className={`${categoryStyle.bg} ${categoryStyle.text} border-0 mt-1 text-xs`}
          >
            {skill.skill_category}
          </Badge>
        </div>
      </div>
      
      {/* Action button */}
      {!isOwner && (
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
