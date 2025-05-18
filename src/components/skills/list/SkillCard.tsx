
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skill, SkillWithProfile } from '../types/skillTypes';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';
import SkillSessionRequestDialog from '../SkillSessionRequestDialog';
import SkillRequestCard from './SkillRequestCard';
import SkillOfferCard from './SkillOfferCard';
import SkillDetailsContent from './SkillDetailsContent';
// Fix the import to use the correct path that provides ModuleItemCard
import { ModuleItemCard } from '@/components/ui/card/index';

/**
 * SkillCard - Main component that renders different skill card types
 * 
 * This enhanced component:
 * - Uses ModuleItemCard for consistent highlighting behavior
 * - Provides proper data attributes for the highlighting system
 * - Handles different card types (request/offer) with appropriate styling
 * - Adds a colored left border based on category
 */
interface SkillCardProps {
  skill: SkillWithProfile;
  onContribute?: () => void;
  type: 'request' | 'offer';
  isHighlighted?: boolean;
}

const SkillCard = ({ skill, onContribute, type, isHighlighted = false }: SkillCardProps) => {
  // Get the current user to determine ownership
  const currentUser = useUser();
  
  // State variables for dialogs
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  
  // Custom hook for skill operations
  const { deleteSkill, isLoading: isDeleting } = useSkillUpdate();
  
  // Check if current user is the skill owner
  const isOwner = currentUser?.id === skill.user_id;
  
  // Handle skill deletion
  const handleDeleteSkill = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    await deleteSkill(skill.id, skill.title);
    setIsDetailsOpen(false);
  };

  // Category color mapping
  const getCategoryColorClass = () => {
    switch(skill.skill_category) {
      case 'creative': return 'border-l-orange-500';
      case 'trade': return 'border-l-purple-500';
      case 'technology': return 'border-l-blue-500';
      case 'education': return 'border-l-green-500';
      case 'wellness': return 'border-l-pink-500';
      default: return 'border-l-gray-500';
    }
  };

  // For skill requests, we render the request card inside a ModuleItemCard for highlighting
  if (type === 'request') {
    return (
      <>
        <ModuleItemCard
          itemId={skill.id}
          itemType="skill"
          isHighlighted={isHighlighted}
          className={`p-0 overflow-hidden border-l-4 ${getCategoryColorClass()}`}
          onClick={() => setIsDetailsOpen(true)}
        >
          <SkillRequestCard
            skill={skill}
            hideActions={true} // Hide actions from card view
          />
        </ModuleItemCard>

        {/* Details dialog */}
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
              showActions={true} // Show actions in detail view
            />
          </DialogContent>
        </Dialog>

        {/* Skill contribution dialog */}
        <SkillSessionRequestDialog
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
          skillId={skill.id}
          skillTitle={skill.title}
          providerId={skill.user_id}
        />
      </>
    );
  }

  // For skill offers, we render the offer card inside a ModuleItemCard for highlighting
  return (
    <>
      <ModuleItemCard
        itemId={skill.id}
        itemType="skill"
        isHighlighted={isHighlighted}
        className={`p-0 overflow-hidden border-l-4 ${getCategoryColorClass()}`}
        onClick={() => setIsDetailsOpen(true)}
      >
        <SkillOfferCard 
          skill={skill}
          isOwner={isOwner}
          hideActions={true} // Hide actions from card view
        />
      </ModuleItemCard>

      {/* Details dialog */}
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
            showActions={true} // Show actions in detail view
          />
        </DialogContent>
      </Dialog>

      {/* Skill request dialog */}
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
