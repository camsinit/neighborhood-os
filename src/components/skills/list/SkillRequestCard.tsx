
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import { Skill } from '../types/skillTypes';

/**
 * SkillRequestCard - Displays a request for skills from other users
 * 
 * This is a more compact card design for the skills request section
 * that allows users to contribute their skills to help others.
 */
interface SkillRequestCardProps {
  skill: Skill & { 
    profiles: { 
      avatar_url: string | null; 
      display_name: string | null; 
    } 
  };
  onContribute: () => void;
}

const SkillRequestCard = ({ skill, onContribute }: SkillRequestCardProps) => {
  // State to manage the schedule dialog visibility
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  return (
    <div 
      data-skill-id={skill.id}
      className="relative flex-shrink-0 w-[250px] h-[120px] border border-dashed border-gray-300 rounded-lg p-3 bg-white cursor-pointer hover:border-gray-400 transition-colors"
    >
      {/* Decorative indicator arrow */}
      <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
      
      <div className="h-full flex flex-col justify-between gap-2">
        {/* User profile and skill title section */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={skill.profiles?.avatar_url || undefined} />
            <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <h4 className="font-medium text-gray-900 line-clamp-2">{skill.title}</h4>
        </div>

        {/* Action buttons */}
        <div className="space-y-1">
          <Button 
            variant="outline" 
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContribute();
            }}
          >
            Contribute Skill
          </Button>
          
          {/* Only show scheduling button when applicable */}
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

        {/* Schedule dialog */}
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
};

export default SkillRequestCard;
