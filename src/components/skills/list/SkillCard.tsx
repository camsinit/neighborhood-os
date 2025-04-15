import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skill, SkillWithProfile } from '../types/skillTypes';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';
import SkillSessionRequestDialog from '../SkillSessionRequestDialog';
import SkillRequestCard from './SkillRequestCard';
import SkillOfferCard from './SkillOfferCard';
import SkillDetailsContent from './SkillDetailsContent';

interface SkillCardProps {
  skill: SkillWithProfile;
  onContribute?: () => void;
  type: 'request' | 'offer';
}

const SkillCard = ({ skill, onContribute, type }: SkillCardProps) => {
  const currentUser = useUser();
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  
  const { deleteSkill, isLoading: isDeleting } = useSkillUpdate();
  
  const isOwner = currentUser?.id === skill.user_id;
  
  const handleDeleteSkill = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    await deleteSkill(skill.id, skill.title);
    setIsDetailsOpen(false);
  };

  if (type === 'request') {
    return (
      <div className="mb-3">
        <div 
          className="relative flex items-center py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer bg-white"
          style={{
            borderLeft: '4px solid #9b87f5'
          }}
        >
          <SkillRequestCard skill={skill} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3">
        <div 
          className="relative flex items-center py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer bg-white"
          style={{
            borderLeft: '4px solid #9b87f5'
          }}
        >
          <SkillOfferCard 
            skill={skill}
            isOwner={isOwner}
            onDelete={handleDeleteSkill}
            isDeleting={isDeleting}
            onRequestSkill={() => setIsRequestDialogOpen(true)}
            onClick={() => setIsDetailsOpen(true)}
          />
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{skill.title}</DialogTitle>
          </DialogHeader>
          
          <SkillDetailsContent 
            skill={skill}
            isOwner={isOwner}
            onDelete={handleDeleteSkill}
            isDeleting={isDeleting}
            onRequestSkill={() => {
              setIsDetailsOpen(false);
              setIsRequestDialogOpen(true);
            }}
          />
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
