
import { GoodsExchangeItem } from '@/types/localTypes';
import AddItemRequestDialog from "@/components/AddSupportRequestDialog";
import ItemRequestDialog from "@/components/items/dialogs/ItemRequestDialog";

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
 * This component manages all the dialogs used on the Items page:
 * - Dialog for adding new items (offers or requests)
 * - Dialog for viewing the details of an existing item
 */
const GoodsDialogs = ({
  isAddRequestOpen,
  selectedRequest,
  onAddRequestOpenChange,
  onSelectedRequestChange,
  initialRequestType
}: GoodsDialogsProps) => {
  return (
    <>
      {/* Dialog for adding new items */}
      <AddItemRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={onAddRequestOpenChange}
        initialRequestType={initialRequestType}
        view="goods" // Updated to use 'goods' instead of 'items'
      />

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
