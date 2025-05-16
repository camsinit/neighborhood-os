
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { format } from 'date-fns';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import { SkillCategory, SkillWithProfile } from '../types/skillTypes';
import SkillContributionDialog from '../SkillContributionDialog';
import { Calendar, Clock, User, HelpingHand } from 'lucide-react';

interface SkillRequestCardProps {
  skill: SkillWithProfile;
}

/**
 * SkillRequestCard - Displays a skill request
 * 
 * This component has been updated to match the design of SkillOfferCard for consistency
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
  
  // Format the creation date for display
  const creationDate = new Date(skill.created_at);
  const formattedDate = format(creationDate, 'MMM d, yyyy');

  return (
    <div 
      className="flex flex-col p-4 cursor-pointer relative w-full"
      onClick={() => setIsContributeDialogOpen(true)}
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
        <Button 
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsContributeDialogOpen(true);
          }}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white border-0"
        >
          <HelpingHand className="h-3 w-3 mr-1" />
          Offer Help
        </Button>
      </div>

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
