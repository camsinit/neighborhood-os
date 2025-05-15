
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import { SkillCategory, SkillWithProfile } from '../types/skillTypes';
import SkillContributionDialog from '../SkillContributionDialog';

interface SkillRequestCardProps {
  skill: SkillWithProfile;
}

/**
 * SkillRequestCard - Displays a skill request in a card format matching SkillOfferCard
 * 
 * This component has been updated to match the formatting of SkillOfferCard for consistency.
 */
const SkillRequestCard = ({ skill }: SkillRequestCardProps) => {
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
      data-skill-id={skill.id}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group"
      onClick={() => setIsContributeDialogOpen(true)}
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
      
      {/* Contribute button that shows on hover */}
      <Button 
        variant="outline" 
        onClick={(e) => {
          e.stopPropagation();
          setIsContributeDialogOpen(true);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white border-0"
      >
        Offer Help
      </Button>

      {/* Only show scheduling button if status is pending_scheduling */}
      {skill.status === 'pending_scheduling' && (
        <FinalizeDateDialog
          sessionId={skill.id}
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        />
      )}

      {/* Contribution dialog */}
      <SkillContributionDialog
        open={isContributeDialogOpen}
        onOpenChange={setIsContributeDialogOpen}
        skillRequestId={skill.id}
        requestTitle={skill.title}
        requesterId={skill.user_id}
      />
    </div>
  );
};

export default SkillRequestCard;
