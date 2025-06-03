
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/**
 * SkillEditDialog - Modal dialog for editing skill titles
 * 
 * This component provides a simple form to edit a skill's title with
 * validation and loading states.
 */
interface SkillEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onSave: () => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isUpdating: boolean;
}

const SkillEditDialog: React.FC<SkillEditDialogProps> = ({
  open,
  onOpenChange,
  editTitle,
  setEditTitle,
  onSave,
  onCancel,
  isUpdating
}) => {
  /**
   * Handle save action with error handling
   */
  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error('Please enter a valid skill title');
      return;
    }

    const result = await onSave();
    if (result.error) {
      toast.error(result.error);
    }
  };

  /**
   * Handle Enter key press to save
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="skill-title">Skill Title</Label>
            <Input
              id="skill-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter skill title..."
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editTitle.trim() || isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillEditDialog;
