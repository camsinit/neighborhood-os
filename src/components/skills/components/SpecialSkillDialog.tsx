
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * Dialog for collecting additional details for special skills
 * Some skills require extra information (like languages, instruments, etc.)
 */
interface SpecialSkillDialogProps {
  isOpen: boolean;
  skillName: string;
  details: string;
  onDetailsChange: (details: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const SpecialSkillDialog: React.FC<SpecialSkillDialogProps> = ({
  isOpen,
  skillName,
  details,
  onDetailsChange,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Details for {skillName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">
              {SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]?.prompt}
            </Label>
            <Input
              placeholder={SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]?.placeholder}
              value={details}
              onChange={(e) => onDetailsChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialSkillDialog;
