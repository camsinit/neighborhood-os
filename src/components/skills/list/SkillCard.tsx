import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import { Skill } from '../types/skillTypes';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import SkillSessionRequestDialog from '../SkillSessionRequestDialog';

interface SkillCardProps {
  skill: Skill & { 
    profiles: { 
      avatar_url: string | null; 
      display_name: string | null; 
    } 
  };
  onContribute?: () => void;
  type: 'request' | 'offer';
}

const SkillCard = ({ skill, onContribute, type }: SkillCardProps) => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  if (type === 'request') {
    return (
      <div 
        className="relative flex-shrink-0 w-[250px] h-[150px] border border-dashed border-gray-300 rounded-lg p-4 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={skill.profiles?.avatar_url || undefined} />
              <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-gray-900 line-clamp-2">{skill.title}</h4>
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onContribute?.();
              }}
            >
              Contribute Skill
            </Button>
            {skill.status === 'pending_scheduling' && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                View Schedule
              </Button>
            )}
          </div>

          {isScheduleDialogOpen && (
            <FinalizeDateDialog
              sessionId={skill.id}
              open={isScheduleDialogOpen}
              onOpenChange={setIsScheduleDialogOpen}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <h4 className="font-medium text-gray-900">{skill.title}</h4>
      </div>
      <Button 
        variant="outline" 
        onClick={() => setIsRequestDialogOpen(true)}
        className="flex-shrink-0"
      >
        Request Skill
      </Button>

      <SkillSessionRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        skillId={skill.id}
        skillTitle={skill.title}
        providerId={skill.user_id}
      />
    </div>
  );
};

export default SkillCard;
