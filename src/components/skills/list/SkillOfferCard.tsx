
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SkillWithProfile, SkillCategory } from '../types/skillTypes';
import { User } from 'lucide-react';

/**
 * SkillOfferCard - The card showing an offered skill
 * 
 * Enhanced with:
 * - Simplified visual design
 * - Hidden actions that appear only in detail view
 * - More streamlined information display
 */
interface SkillOfferCardProps {
  skill: SkillWithProfile;
  isOwner: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  onRequestSkill?: () => void;
  onClick?: () => void;
  hideActions?: boolean; // New prop to control action visibility
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
  onClick,
  hideActions = false
}: SkillOfferCardProps) => {
  // Get the category colors from our map, fallback to technology if not found
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;
  
  return (
    <div 
      className="flex flex-col p-4 cursor-pointer relative w-full"
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full">
        {/* User profile and skill title */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={skill.profiles?.avatar_url || undefined} />
            <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="font-medium text-gray-900">{skill.title}</h4>
            <p className="text-xs text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {skill.profiles?.display_name || 'Anonymous'}
            </p>
          </div>
        </div>
        
        {/* Category tag */}
        <Badge 
          className={`${categoryStyle.bg} ${categoryStyle.text} border-0 text-xs`}
        >
          {skill.skill_category.charAt(0).toUpperCase() + skill.skill_category.slice(1)}
        </Badge>
      </div>
      
      {/* Description preview - only show 1 line instead of 2 */}
      {skill.description && (
        <p className="mt-2 text-sm text-gray-700 line-clamp-1">
          {skill.description}
        </p>
      )}
    </div>
  );
};

export default SkillOfferCard;
