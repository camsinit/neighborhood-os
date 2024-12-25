import DialogWrapper from "./dialog/DialogWrapper";
import SupportRequestForm from "./support/SupportRequestForm";

interface AddSupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: "need" | "offer" | null;
}

const AddSupportRequestDialog = ({ open, onOpenChange, initialRequestType }: AddSupportRequestDialogProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Share Need or Offer"
    >
      <SupportRequestForm 
        onClose={() => onOpenChange(false)}
        initialValues={{ requestType: initialRequestType || null }}
      />
    </DialogWrapper>
  );
};

export default AddSupportRequestDialog;