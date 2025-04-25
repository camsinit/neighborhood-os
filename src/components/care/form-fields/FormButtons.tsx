
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

/**
 * FormButtons component
 * 
 * This component renders the form action buttons (save, cancel, delete)
 * with confirmation dialog for delete action
 */
interface FormButtonsProps {
  onClose: () => void;
  isSubmitting: boolean;
  editMode?: boolean;
  onDelete?: () => void;
}

export const FormButtons = ({
  onClose,
  isSubmitting,
  editMode = false,
  onDelete
}: FormButtonsProps) => (
  <div className="flex justify-between">
    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
      Cancel
    </Button>
    
    <div className="flex gap-2">
      {/* Delete button with confirmation (only in edit mode) */}
      {editMode && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your care request.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (editMode ? 'Update' : 'Create')}
      </Button>
    </div>
  </div>
);
