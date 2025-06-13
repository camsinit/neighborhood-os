
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skill, SkillWithProfile } from '../types/skillTypes';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';
import { generateDataAttributes } from '@/utils/dataAttributes';
import SkillRequestCard from './SkillRequestCard';
import SkillOfferCard from './SkillOfferCard';
import SkillDetailsContent from './SkillDetailsContent';

/**
 * SkillCard - Main component that renders different skill card types
 * 
 * This component has been refactored to use smaller, focused components
 * for better maintainability and clarity. It now serves as a container
 * that determines which card type to show based on props.
 * Updated to include proper data attributes for highlighting and navigation.
 */
interface SkillCardProps {
  skill: SkillWithProfile;
  onContribute?: () => void;
  type: 'request' | 'offer';
}

const SkillCard = ({ skill, onContribute, type }: SkillCardProps) => {
  // Get the current user to determine ownership
  const currentUser = useUser();
  
  // State variables for dialogs
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Custom hook for skill operations
  const { deleteSkill, isLoading: isDeleting } = useSkillUpdate();
  
  // Check if current user is the skill owner
  const isOwner = currentUser?.id === skill.user_id;
  
  // Generate data attributes for highlighting and navigation
  const dataAttributes = generateDataAttributes('skills', skill.id);
  
  // Handle skill deletion
  const handleDeleteSkill = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    await deleteSkill(skill.id, skill.title);
    setIsDetailsOpen(false);
  };

  // For skill requests, we render the request card component
  if (type === 'request') {
    return (
      <div {...dataAttributes}>
        <SkillRequestCard
          skill={skill}
        />
      </div>
    );
  }

  // For skill offers, we render the offer card and detail dialog
  return (
    <>
      <div {...dataAttributes}>
        <SkillOfferCard 
          skill={skill}
          isOwner={isOwner}
          onDelete={handleDeleteSkill}
          isDeleting={isDeleting}
          onRequestSkill={() => {}} // No longer using request skill functionality
          onClick={() => setIsDetailsOpen(true)}
        />
      </div>

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
            onRequestSkill={() => {}} // No longer using request skill functionality
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SkillCard;
