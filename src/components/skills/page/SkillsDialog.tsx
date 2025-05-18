
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SkillForm from '@/components/skills/SkillForm';

// Props for the SkillsDialog component
interface SkillsDialogProps {
  isOpen: boolean;
  mode: 'offer' | 'request' | 'multi-request'; // Added multi-request mode
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * SkillsDialog - Component for displaying the skill form in a dialog
 * 
 * This component has been updated to support multi-provider requests
 */
const SkillsDialog: React.FC<SkillsDialogProps> = ({ 
  isOpen,
  mode,
  onClose,
  onSuccess
}) => {
  // Determine the title based on the mode
  const dialogTitle = () => {
    switch(mode) {
      case 'offer': return 'Offer a Skill';
      case 'request': return 'Request a Skill';
      case 'multi-request': return 'Request a Skill from Multiple Providers';
      default: return 'Skill Exchange';
    }
  };
  
  // Calculate the actual form mode (multi-request uses the request form)
  const formMode = mode === 'multi-request' ? 'request' : mode;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {dialogTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {/* Show informational message for multi-provider requests */}
        {mode === 'multi-request' && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4 text-sm">
            Your request will be sent to all neighbors who have offered similar skills.
            The first provider to claim your request will be matched with you.
          </div>
        )}
        
        <SkillForm 
          mode={formMode}
          isMultiProvider={mode === 'multi-request'}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SkillsDialog;
