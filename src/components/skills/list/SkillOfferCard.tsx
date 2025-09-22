
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SkillWithProfile, SkillCategory } from '../types/skillTypes';

import { useState } from 'react';

/**
 * SkillOfferCard - The compact card showing an offered skill
 * 
 * This appears in the list of available skills with actions
 * appropriate based on whether you're the owner or not.
 * Updated to use SkillContactPopover for the request functionality.
 * Now uses the same styling as the Add Skill button for consistency.
 */
interface SkillOfferCardProps {
  skill: SkillWithProfile;
  isOwner: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onRequestSkill: () => void;
  onClick: () => void;
}

// Updated to use the new standardized 6 categories
const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
  technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
  emergency: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
  professional: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
  maintenance: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
  care: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
  education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'}
};

const SkillOfferCard = ({ 
  skill, 
  isOwner, 
  onDelete,
  isDeleting, 
  onRequestSkill,
  onClick 
}: SkillOfferCardProps) => {
  // Add state to track hover for share button
  const [isHovering, setIsHovering] = useState(false);
  // Get the category colors from our map, fallback to technology if not found
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;

  return (
    <div 
      data-skill-id={skill.id}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* User profile and skill title */}
      <div className="flex items-center gap-3 flex-grow">
        <Avatar className="h-10 w-10">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h4 className="font-medium text-gray-900">{skill.title}</h4>
        </div>
      </div>
      
      
      {/* Category tag that hides on hover */}
      <Badge 
        className={`${categoryStyle.bg} ${categoryStyle.text} border-0 text-xs absolute right-2 top-1/2 transform -translate-y-1/2 group-hover:opacity-0 transition-opacity`}
      >
        {skill.skill_category.charAt(0).toUpperCase() + skill.skill_category.slice(1)}
      </Badge>
      
      {/* Request button that shows on hover - now styled to match Add Skill button */}
      {!isOwner && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering
              onRequestSkill();
            }}
            className="bg-green-500 hover:bg-green-600 text-white border-0 font-medium"
          >
            Request Skill
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillOfferCard;
