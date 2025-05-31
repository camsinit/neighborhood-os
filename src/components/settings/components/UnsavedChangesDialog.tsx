
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

/**
 * Props for UnsavedChangesDialog component
 */
interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeaveWithoutSaving: () => void;
  onSaveAndLeave: () => void;
}

/**
 * UnsavedChangesDialog Component
 * 
 * Shows a confirmation dialog when user tries to leave with unsaved changes
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onLeaveWithoutSaving,
  onSaveAndLeave
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Do you want to save before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onLeaveWithoutSaving}
            className={buttonVariants({ variant: "destructive" })}
          >
            Leave without saving
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onSaveAndLeave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save and leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
