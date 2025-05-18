
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import { SkillCategory, SkillWithProfile } from '../types/skillTypes';
import SkillContributionDialog from '../SkillContributionDialog';
import { User } from 'lucide-react';

interface SkillRequestCardProps {
  skill: SkillWithProfile;
  hideActions?: boolean; // New prop to control action visibility
}

/**
 * SkillRequestCard - Displays a skill request
 * 
 * This component has been updated with a simplified design
 * and actions that are only shown in detail view
 */
const SkillRequestCard = ({ 
  skill,
  hideActions = false
}: SkillRequestCardProps) => {
  // State for managing dialogs
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);

  // This maps categories to their appropriate colors (same as SkillOfferCard)
  const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
    creative: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
    trade: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
    technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
    education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'},
    wellness: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
  };

  // Get the category colors from our map, fallback to technology if not found
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;
  
  return (
    <div 
      className="flex flex-col p-4 cursor-pointer relative w-full"
      onClick={() => hideActions ? undefined : setIsContributeDialogOpen(true)}
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
      
      {/* Description preview - limit to just 1 line */}
      {skill.description && (
        <p className="mt-2 text-sm text-gray-700 line-clamp-1">
          {skill.description}
        </p>
      )}
      
      {/* Only show scheduling button if status is pending_scheduling */}
      {skill.status === 'pending_scheduling' && !hideActions && (
        <FinalizeDateDialog
          sessionId={skill.id}
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        />
      )}

      {/* Contribution dialog - only available when not in card view */}
      {!hideActions && (
        <SkillContributionDialog
          open={isContributeDialogOpen}
          onOpenChange={setIsContributeDialogOpen}
          skillRequestId={skill.id}
          requestTitle={skill.title}
          requesterId={skill.user_id}
        />
      )}
    </div>
  );
};

export default SkillRequestCard;
