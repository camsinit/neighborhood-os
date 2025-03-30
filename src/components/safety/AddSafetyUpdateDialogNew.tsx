
import DialogWrapper from "@/components/dialog/DialogWrapper";
import SafetyUpdateFormNew from "./SafetyUpdateFormNew";

/**
 * AddSafetyUpdateDialogNew component
 * 
 * Updated dialog for sharing safety updates in the community
 * with a cleaner interface and more specific fields
 */
interface AddSafetyUpdateDialogNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSafetyUpdateDialogNew = ({ open, onOpenChange }: AddSafetyUpdateDialogNewProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Share Safety Update"
      maxWidth="sm"
    >
      <SafetyUpdateFormNew onClose={() => onOpenChange(false)} />
    </DialogWrapper>
  );
};

export default AddSafetyUpdateDialogNew;
