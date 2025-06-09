
import { GoodsExchangeItem } from '@/types/localTypes';
import ItemRequestDialog from "@/components/items/dialogs/ItemRequestDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoodsForm from "./GoodsForm";

/**
 * Props interface for the GoodsDialogs component
 * 
 * Defines the properties needed to control the dialogs for viewing and adding items
 */
interface GoodsDialogsProps {
  isAddRequestOpen: boolean;
  selectedRequest: GoodsExchangeItem | null;
  onAddRequestOpenChange: (open: boolean) => void;
  onSelectedRequestChange: (request: GoodsExchangeItem | null) => void;
  initialRequestType: "need" | "offer" | null;
}

/**
 * GoodsDialogs component
 * 
 * This component manages all the dialogs used on the Goods page:
 * - Dialog for adding new items using the proper GoodsForm (offers or requests)
 * - Dialog for viewing the details of an existing item
 * 
 * Updated to use the dedicated GoodsForm instead of the generic AddSupportRequestDialog
 */
const GoodsDialogs = ({
  isAddRequestOpen,
  selectedRequest,
  onAddRequestOpenChange,
  onSelectedRequestChange,
  initialRequestType
}: GoodsDialogsProps) => {
  // Determine the dialog title based on the request type
  const getDialogTitle = () => {
    if (!initialRequestType) return "Add Item";
    return initialRequestType === "offer" ? "Offer an Item" : "Request an Item";
  };

  return (
    <>
      {/* Dialog for adding new items using the dedicated GoodsForm */}
      <Dialog open={isAddRequestOpen} onOpenChange={onAddRequestOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <GoodsForm 
            onClose={() => onAddRequestOpenChange(false)}
            initialRequestType={initialRequestType}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing item details */}
      <ItemRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={() => onSelectedRequestChange(null)}
      />
    </>
  );
};

export default GoodsDialogs;
