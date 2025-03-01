
import DialogWrapper from "./dialog/DialogWrapper";
import SupportRequestForm from "./support/SupportRequestForm";
import SkillForm from "./skills/SkillForm";
import GoodsForm from "./goods/GoodsForm";

/**
 * AddSupportRequestDialog component
 * 
 * This dialog allows users to add various types of support requests:
 * - General support requests (using SupportRequestForm)
 * - Skill requests/offers (using SkillForm)
 * - Goods requests/offers (using GoodsForm)
 * 
 * The component selects the appropriate form based on the 'view' prop.
 */
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
  // Determine which view to show based on the props
  const isSkillsView = view === 'skills';
  const isGoodsView = view === 'goods';
  
  // Set the dialog title based on the view and request type
  const getDialogTitle = () => {
    // For skills view
    if (isSkillsView) {
      return initialRequestType === 'need' ? 'Request a Skill' : 'Offer a Skill';
    }
    
    // For goods view
    if (isGoodsView) {
      return initialRequestType === 'need' ? 'Request an Item' : 'Offer an Item';
    }
    
    // For general support
    return initialRequestType === 'need' ? 'Share Need' : 'Share Offer';
  };
  
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={getDialogTitle()}
    >
      {isSkillsView ? (
        <SkillForm 
          onClose={() => onOpenChange(false)}
          mode={initialRequestType === 'need' ? 'request' : 'offer'}
        />
      ) : isGoodsView ? (
        <GoodsForm 
          onClose={() => onOpenChange(false)}
          initialRequestType={initialRequestType || 'offer'}
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
