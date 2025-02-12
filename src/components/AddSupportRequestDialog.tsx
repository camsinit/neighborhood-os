
import DialogWrapper from "./dialog/DialogWrapper";
import SupportRequestForm from "./support/SupportRequestForm";
import SkillForm from "./skills/SkillForm";

interface AddSupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: "need" | "offer" | null;
  view?: string;
}

const AddSupportRequestDialog = ({ 
  open, 
  onOpenChange, 
  initialRequestType,
  view 
}: AddSupportRequestDialogProps) => {
  const isSkillsView = view === 'skills';
  
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={
        isSkillsView
          ? initialRequestType === 'need' 
            ? 'Request a Skill'
            : 'Offer a Skill'
          : initialRequestType === 'need'
            ? 'Share Need'
            : 'Share Offer'
      }
    >
      {isSkillsView ? (
        <SkillForm 
          onClose={() => onOpenChange(false)}
          mode={initialRequestType === 'need' ? 'request' : 'offer'}
        />
      ) : (
        <SupportRequestForm 
          onClose={() => onOpenChange(false)}
          initialValues={{ 
            requestType: initialRequestType || null,
            category: 'goods'
          }}
        />
      )}
    </DialogWrapper>
  );
};

export default AddSupportRequestDialog;
