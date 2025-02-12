
import DialogWrapper from "./dialog/DialogWrapper";
import SupportRequestForm from "./support/SupportRequestForm";

interface AddSupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: "need" | "offer" | null;
}

const AddSupportRequestDialog = ({ 
  open, 
  onOpenChange, 
  initialRequestType 
}: AddSupportRequestDialogProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={initialRequestType === 'need' ? 'Share Need' : 'Share Offer'}
    >
      <SupportRequestForm 
        onClose={() => onOpenChange(false)}
        initialValues={{ 
          requestType: initialRequestType || null,
          category: 'goods' // Default to goods since we're in the goods section
        }}
      />
    </DialogWrapper>
  );
};

export default AddSupportRequestDialog;
