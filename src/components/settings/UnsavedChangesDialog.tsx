
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

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSaveAndLeave: () => void;
}

/**
 * Dialog to warn users about unsaved changes
 * 
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to change open state
 * @param onDiscard - Function to discard changes
 * @param onSaveAndLeave - Function to save changes and leave
 */
const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onDiscard,
  onSaveAndLeave,
}: UnsavedChangesDialogProps) => {
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
            onClick={onDiscard}
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

export default UnsavedChangesDialog;
