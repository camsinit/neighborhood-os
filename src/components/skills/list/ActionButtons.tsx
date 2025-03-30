
/**
 * Action buttons component for skill details
 */
import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Props for ActionButtons component
 */
interface ActionButtonsProps {
  isOwner: boolean;
  isRequest: boolean;
  onDelete?: () => void;
  onRequestSkill?: () => void;
  isDeleting?: boolean;
}

/**
 * Component for action buttons in the skill details view
 * Shows different buttons based on whether the user is the owner
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOwner,
  isRequest,
  onDelete,
  onRequestSkill,
  isDeleting
}) => {
  if (isOwner && onDelete) {
    return (
      <div className="pt-4">
        <Button 
          onClick={onDelete}
          variant="destructive"
          disabled={isDeleting}
          className="w-full"
        >
          {isDeleting ? 'Deleting...' : 'Delete Skill'}
        </Button>
      </div>
    );
  } 
  
  if (!isOwner) {
    return (
      <div className="pt-4">
        <Button 
          onClick={onRequestSkill}
          className="w-full"
        >
          {isRequest ? 'Offer to Help' : 'Request to Learn'}
        </Button>
      </div>
    );
  }
  
  return null;
};

export default ActionButtons;
