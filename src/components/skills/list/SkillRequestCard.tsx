
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import { SkillWithProfile } from '../types/skillTypes';
import { SkillContributionDialog } from '../SkillContributionDialog';

interface SkillRequestCardProps {
  skill: SkillWithProfile;
}

const SkillRequestCard = ({ skill }: SkillRequestCardProps) => {
  // State to manage the schedule dialog visibility
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);

  return (
    <div 
      data-skill-id={skill.id}
      className="relative flex-shrink-0 w-[250px] h-[100px] border border-dashed border-gray-300 rounded-lg p-3 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      onClick={() => setIsContributeDialogOpen(true)}
    >
      {/* Decorative indicator arrow */}
      <ArrowUpRight className="absolute top-2 right-2 h-3 w-3 text-gray-400" />
      
      <div className="h-full flex flex-col justify-between gap-1">
        {/* User profile and skill title section - more compact layout */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={skill.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{skill.title}</h4>
        </div>

        {/* Only show scheduling button when applicable */}
        {skill.status === 'pending_scheduling' && (
          <Button
            variant="secondary"
            className="w-full mt-1 h-7 text-xs py-0"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsScheduleDialogOpen(true);
            }}
          >
            View Schedule
          </Button>
        )}
      </div>

      {/* Schedule dialog */}
      {isScheduleDialogOpen && (
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
