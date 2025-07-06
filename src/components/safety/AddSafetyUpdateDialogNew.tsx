import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SafetyUpdateForm from "./SafetyUpdateForm";
interface AddSafetyUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modern dialog component for adding safety updates
 * Uses the unified SafetyUpdateForm component with database triggers
 */
const AddSafetyUpdateDialogNew = ({
  open,
  onOpenChange
}: AddSafetyUpdateDialogProps) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Update</DialogTitle>
        </DialogHeader>
        <SafetyUpdateForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>;
};
export default AddSafetyUpdateDialogNew;