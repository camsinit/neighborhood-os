
import UniversalDialog from "@/components/ui/universal-dialog";
import CareRequestForm from "./CareRequestForm";

interface AddCareRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: "need" | "offer";
}

const AddCareRequestDialog = ({ 
  open, 
  onOpenChange,
  initialRequestType = "need"
}: AddCareRequestDialogProps) => {
  // Get the dialog title based on the request type
  const getDialogTitle = () => {
    return initialRequestType === 'need' ? 'Request Care' : 'Offer Care';
  };
  
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={getDialogTitle()}
      maxWidth="sm"
    >
      <CareRequestForm 
        onClose={() => onOpenChange(false)}
        initialValues={{ requestType: initialRequestType }}
      />
    </UniversalDialog>
  );
};

export default AddCareRequestDialog;

