
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * SkillDeleteConfirmation - Confirmation popover for skill deletion
 * 
 * This component shows a confirmation dialog when a user wants to delete
 * their skill, with clear messaging about the irreversible action.
 */
interface SkillDeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillTitle?: string;
  onConfirm: () => Promise<{ success: boolean }>;
  onCancel: () => void;
  isUpdating: boolean;
  children: React.ReactNode;
}

const SkillDeleteConfirmation: React.FC<SkillDeleteConfirmationProps> = ({
  open,
  onOpenChange,
  skillTitle,
  onConfirm,
  onCancel,
  isUpdating,
  children
}) => {
  /**
   * Handle delete confirmation
   */
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Delete Skill</h4>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete "{skillTitle}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SkillDeleteConfirmation;
