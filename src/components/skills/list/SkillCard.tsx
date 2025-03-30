
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight, Trash2 } from 'lucide-react'; // Import Trash2 icon for delete button
import { Skill } from '../types/skillTypes';
import { useState } from 'react';
import { FinalizeDateDialog } from '../FinalizeDateDialog';
import SkillSessionRequestDialog from '../SkillSessionRequestDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@supabase/auth-helpers-react'; // Import useUser hook to get current user
import { toast } from 'sonner'; // Import toast for notifications
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

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
  // Get the current authenticated user
  const currentUser = useUser();
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  
  // Check if the current user is the owner of this skill
  const isOwner = currentUser?.id === skill.user_id;
  
  // Handle skill deletion
  const handleDeleteSkill = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    
    try {
      // Delete the skill from the database
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', skill.id);
        
      if (error) {
        throw error;
      }
      
      // Show success message
      toast.success('Skill deleted successfully');
      
      // Track this deletion in the activities (optional)
      try {
        // Call the edge function to update activities
        const { error: functionError } = await supabase.functions.invoke('notify-skills-changes', {
          body: {
            skillId: skill.id,
            action: 'delete',
            skillTitle: skill.title,
            changes: 'Skill deleted'
          }
        });

        if (functionError) {
          console.error('Error calling notify-skills-changes function:', functionError);
        }
      } catch (functionError) {
        console.error('Failed to notify about skill deletion:', functionError);
        // Non-critical error, we don't need to show this to the user
      }
      
      // Dispatch custom event to refresh skills list
      document.dispatchEvent(new CustomEvent('skill-deleted', {
        detail: { id: skill.id }
      }));
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill. Please try again.');
    }
  };

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
        {/* Show different buttons based on ownership */}
        {isOwner ? (
          // Show delete button for the owner
          <Button 
            variant="destructive" 
            onClick={handleDeleteSkill}
            className="ml-4"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        ) : (
          // Show request button for other users
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
        )}
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

            {/* Only show the request button in the dialog if user is not the owner */}
            {!isOwner ? (
              <Button 
                className="w-full"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsRequestDialogOpen(true);
                }}
              >
                Request this Skill
              </Button>
            ) : (
              <Button 
                variant="destructive"
                className="w-full"
                onClick={handleDeleteSkill}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete this Skill
              </Button>
            )}
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
