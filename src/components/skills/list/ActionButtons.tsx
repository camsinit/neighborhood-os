
/**
 * Action buttons component for skill details
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Props for ActionButtons component
 */
interface ActionButtonsProps {
  isOwner: boolean;
  isRequest: boolean;
  onDelete?: () => void;
  onRequestSkill?: () => void;
  isDeleting?: boolean;
  hasActiveSessions?: boolean;
}

/**
 * Component for action buttons in the skill details view
 * Shows different buttons based on whether the user is the owner
 * 
 * @param isOwner - Whether the current user owns this skill
 * @param isRequest - Whether this is a skill request (vs. offer)
 * @param onDelete - Function to call when delete button is clicked
 * @param onRequestSkill - Function to call when request/offer button is clicked
 * @param isDeleting - Whether the deletion is in progress
 * @param hasActiveSessions - Whether this skill has active sessions that prevent deletion
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOwner,
  isRequest,
  onDelete,
  onRequestSkill,
  isDeleting = false,
  hasActiveSessions = false
}) => {
  // For owners, show delete button
  if (isOwner && onDelete) {
    return (
      <div className="pt-4">
        <Button 
          onClick={onDelete}
          variant="destructive"
          disabled={isDeleting || hasActiveSessions}
          className="w-full"
          aria-label="Delete this skill"
        >
          {isDeleting ? 'Deleting...' : 'Delete Skill'}
        </Button>
        
        {hasActiveSessions && (
          <div className="mt-2 flex items-center gap-2 text-amber-500 text-xs">
            <AlertCircle size={14} />
            <span>Cannot delete skills with active sessions</span>
          </div>
        )}
      </div>
    );
  } 
  
  // For non-owners, show action button
  if (!isOwner && onRequestSkill) {
    return (
      <div className="pt-4">
        <Button 
          onClick={onRequestSkill}
          className="w-full"
          aria-label={isRequest ? 'Offer to help with this skill' : 'Request to learn this skill'}
        >
          {isRequest ? 'Offer to Help' : 'Request to Learn'}
        </Button>
      </div>
    );
  }
  
  // Default case - no buttons
  return null;
};

export default ActionButtons;
