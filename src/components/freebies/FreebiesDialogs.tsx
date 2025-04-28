
import { GoodsExchangeItem } from '@/types/localTypes';
import AddItemRequestDialog from "@/components/AddSupportRequestDialog";
import ItemRequestDialog from "@/components/items/dialogs/ItemRequestDialog";

/**
 * Props interface for the FreebiesDialogs component
 * 
 * Defines the properties needed to control the dialogs for viewing and adding freebies
 */
interface FreebiesDialogsProps {
  isAddRequestOpen: boolean;
  selectedRequest: GoodsExchangeItem | null;
  onAddRequestOpenChange: (open: boolean) => void;
  onSelectedRequestChange: (request: GoodsExchangeItem | null) => void;
  initialRequestType: "need" | "offer" | null;
}

/**
 * FreebiesDialogs component
 * 
 * This component manages all the dialogs used on the Freebies page:
 * - Dialog for adding new freebies (offers or requests)
 * - Dialog for viewing the details of an existing freebie
 */
const FreebiesDialogs = ({
  isAddRequestOpen,
  selectedRequest,
  onAddRequestOpenChange,
  onSelectedRequestChange,
  initialRequestType
}: FreebiesDialogsProps) => {
  return (
    <>
      {/* Dialog for adding new freebies */}
      <AddItemRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={onAddRequestOpenChange}
        initialRequestType={initialRequestType}
        view="items" // This is the key parameter that routes to GoodsForm (we'll keep this for compatibility)
      />

      {/* Dialog for viewing freebie details */}
      <ItemRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={() => onSelectedRequestChange(null)}
      />
    </>
  );
};

export default FreebiesDialogs;
