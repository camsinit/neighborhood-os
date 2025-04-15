import UniversalDialog from "./ui/universal-dialog";
import SupportRequestForm from "./support/SupportRequestForm";
import SkillForm from "./skills/SkillForm";
import GoodsForm from "./goods/GoodsForm";

/**
 * AddSupportRequestDialog component
 * 
 * This dialog serves as a router to different form types based on the 'view' prop:
 * - Generic support requests use the legacy SupportRequestForm
 * - Skills use the dedicated SkillForm
 * - Goods use the dedicated GoodsForm
 * 
 * Each form type saves to its own dedicated database table and uses its own logic.
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
  // Determine which specific form to show based on the view prop
  const isSkillsView = view === 'skills';
  const isGoodsView = view === 'goods';
  
  // Set the dialog title based on the view and request type
  const getDialogTitle = () => {
    // For skills view - skills have their own dedicated form and database table
    if (isSkillsView) {
      return initialRequestType === 'need' ? 'Request a Skill' : 'Offer a Skill';
    }
    
    // For goods view - goods have their own dedicated form and database table (goods_exchange)
    if (isGoodsView) {
      return initialRequestType === 'need' ? 'Request an Item' : 'Offer an Item';
    }
    
    // For generic support - this uses the legacy support_requests table
    return initialRequestType === 'need' ? 'Share Need' : 'Share Offer';
  };
  
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={getDialogTitle()}
      maxWidth="sm"
    >
      {/* Render the appropriate form based on the view prop */}
      {isSkillsView ? (
        <SkillForm 
          onClose={() => onOpenChange(false)}
          mode={initialRequestType === 'need' ? 'request' : 'offer'}
        />
      ) : isGoodsView ? (
        <GoodsForm 
          onClose={() => onOpenChange(false)}
          // Pass the initialRequestType directly without conversion
          // Our updated hook will handle the type conversion internally
          initialRequestType={initialRequestType}
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
    </UniversalDialog>
  );
};

export default AddSupportRequestDialog;
