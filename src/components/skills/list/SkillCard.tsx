import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import { Skill } from '../types/skillTypes';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import SkillSessionRequestDialog from '../SkillSessionRequestDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  if (type === 'request') {
    return (
      <div 
        data-skill-id={skill.id}
        className="relative flex-shrink-0 w-[250px] h-[120px] border border-dashed border-gray-300 rounded-lg p-3 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
        <div className="h-full flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={skill.profiles?.avatar_url || undefined} />
              <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-gray-900 line-clamp-2">{skill.title}</h4>
          </div>
          <div className="space-y-1">
            <Button 
              variant="outline" 
              className="w-full"
              size="sm"
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
                size="sm"
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
    <>
      <div 
        data-skill-id={skill.id}
        className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={skill.profiles?.avatar_url || undefined} />
            <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <h4 className="font-medium text-gray-900">{skill.title}</h4>
        </div>
        <Button 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            setIsRequestDialogOpen(true);
          }}
          className="ml-4"
        >
          Request Skill
        </Button>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{skill.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={skill.profiles?.avatar_url || undefined} />
                <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900">
                  {skill.profiles?.display_name || 'Anonymous'}
                </h4>
                <p className="text-sm text-gray-500">Skill Provider</p>
              </div>
            </div>

            {skill.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">About this skill</h4>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </div>
            )}

            {skill.availability && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Availability</h4>
                <p className="text-sm text-gray-600">{skill.availability}</p>
              </div>
            )}

            {skill.time_preferences && skill.time_preferences.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Preferred Times</h4>
                <div className="flex flex-wrap gap-2">
                  {skill.time_preferences.map((time, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button 
              className="w-full"
              onClick={() => {
                setIsDetailsOpen(false);
                setIsRequestDialogOpen(true);
              }}
            >
              Request this Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SkillSessionRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        skillId={skill.id}
        skillTitle={skill.title}
        providerId={skill.user_id}
      />
    </>
  );
};

export default SkillCard;
