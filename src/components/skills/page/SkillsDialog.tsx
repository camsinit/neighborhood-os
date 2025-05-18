
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SkillForm from '@/components/skills/SkillForm';

// Props for the SkillsDialog component
interface SkillsDialogProps {
  isOpen: boolean;
  mode: 'offer' | 'request';
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * SkillsDialog - Component for displaying the skill form in a dialog
 * 
 * This component handles the dialog for adding or requesting skills
 */
const SkillsDialog: React.FC<SkillsDialogProps> = ({ 
  isOpen,
  mode,
  onClose,
  onSuccess
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'offer' ? 'Offer a Skill' : 'Request a Skill'}
          </DialogTitle>
        </DialogHeader>
        <SkillForm 
          mode={mode}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SkillsDialog;
