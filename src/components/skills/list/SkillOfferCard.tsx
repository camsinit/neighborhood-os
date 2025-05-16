
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SkillWithProfile, SkillCategory } from '../types/skillTypes';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

/**
 * SkillOfferCard - The card showing an offered skill
 * 
 * Enhanced with:
 * - Improved visual design
 * - Better category styling
 * - More skill information display
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
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;
  
  // Format the creation date for display
  const creationDate = new Date(skill.created_at);
  const formattedDate = format(creationDate, 'MMM d, yyyy');

  return (
    <div 
      className="flex flex-col p-4 cursor-pointer relative w-full"
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full">
        {/* User profile and skill title */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={skill.profiles?.avatar_url || undefined} />
            <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="font-medium text-gray-900">{skill.title}</h4>
            <p className="text-sm text-gray-500 flex items-center">
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
      
      {/* Description preview (if available) */}
      {skill.description && (
        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
          {skill.description}
        </p>
      )}
      
      {/* Additional metadata */}
      <div className="flex items-center mt-2 text-xs text-gray-500 gap-3">
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {formattedDate}
        </span>
        
        {skill.availability && (
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {skill.availability}
          </span>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="mt-3 flex justify-end">
        {isOwner ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Remove'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRequestClick}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white border-0"
          >
            Request Skill
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillOfferCard;
