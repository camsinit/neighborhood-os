
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Props for the ContributionFormFooter component
 */
interface ContributionFormFooterProps {
  isSubmitting?: boolean;
  addToProfile: boolean;
  onAddToProfileChange: (checked: boolean) => void;
  onSubmit: () => void;
}

/**
 * Footer component for the skill contribution form
 * Contains the "Add to profile" checkbox and submit button
 */
const ContributionFormFooter: React.FC<ContributionFormFooterProps> = ({
  isSubmitting = false,
  addToProfile,
  onAddToProfileChange,
  onSubmit
}) => {
  return (
    <>
      {/* Option to add skill to profile */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="add-to-profile"
          checked={addToProfile}
          onCheckedChange={(checked) => onAddToProfileChange(checked as boolean)}
        />
        <Label htmlFor="add-to-profile">
          Add this skill to my profile for future requests
        </Label>
      </div>

      {/* Submit button */}
      <DialogFooter>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Offer to Contribute'}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ContributionFormFooter;
