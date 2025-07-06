import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RecurringEventConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (applyToAll: boolean) => void;
  eventTitle: string;
  action: 'delete' | 'edit';
  isLoading?: boolean;
}

/**
 * RecurringEventConfirmDialog Component
 * 
 * This component shows a confirmation dialog when users try to edit or delete
 * a recurring event, asking whether they want to apply changes to just this
 * instance or all future instances.
 * 
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to handle dialog open/close
 * @param onConfirm - Function to handle confirmation with the user's choice
 * @param eventTitle - Title of the event being modified
 * @param action - Whether this is for editing or deleting
 * @param isLoading - Whether an action is currently in progress
 */
const RecurringEventConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  eventTitle,
  action,
  isLoading = false
}: RecurringEventConfirmDialogProps) => {
  // State to track the user's choice: 'this' for this event only, 'all' for all events
  const [choice, setChoice] = useState<'this' | 'all'>('this');

  // Handle the confirmation
  const handleConfirm = () => {
    onConfirm(choice === 'all');
  };

  // Handle cancel - close the dialog
  const handleCancel = () => {
    onOpenChange(false);
    setChoice('this'); // Reset to default choice
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'delete' ? 'Delete repeat event' : 'Edit repeat event'} "{eventTitle}"
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Choose whether to apply changes to this event only or all events in the series.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Radio group for user choice */}
        <div className="py-4">
          <RadioGroup value={choice} onValueChange={(value: 'this' | 'all') => setChoice(value)}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="this" id="this-event" />
              <Label htmlFor="this-event" className="flex-1 cursor-pointer">
                This event
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="all" id="all-events" />
              <Label htmlFor="all-events" className="flex-1 cursor-pointer">
                All events
              </Label>
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant={action === 'delete' ? 'destructive' : 'default'}
          >
            {isLoading ? (
              action === 'delete' ? 'Deleting...' : 'Saving...'
            ) : (
              action === 'delete' ? 'Delete' : 'Save'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RecurringEventConfirmDialog;