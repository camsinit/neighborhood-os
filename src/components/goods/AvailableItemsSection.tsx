
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import UniversalDialog from "@/components/ui/universal-dialog";
import GoodsForm from './GoodsForm';
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import AvailableGoodsCard from './cards/AvailableGoodsCard';
import { useUser } from '@supabase/auth-helpers-react';

interface AvailableItemsSectionProps {
  goodsItems: GoodsExchangeItem[];
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onRefetch: () => void;
}

/**
 * AvailableItemsSection - Section for displaying available goods items
 * 
 * Updated to display items in a grid with fixed-width compact cards
 * and use a centered modal dialog instead of a side popover for better focus.
 * Now properly closes dialog when item is deleted.
 */
const AvailableItemsSection: React.FC<AvailableItemsSectionProps> = ({
  goodsItems,
  onDeleteItem,
  isDeletingItem = false,
  onRefetch
}) => {
  // Get current user to check ownership
  const user = useUser();
  const [itemToEdit, setItemToEdit] = useState<GoodsExchangeItem | null>(null);

  // Function to check if current user owns the item
  const isOwner = (item: GoodsExchangeItem) => {
    return user?.id === item.user_id;
  };

  const handleEdit = (item: GoodsExchangeItem) => {
    // Only allow editing if user owns the item
    if (isOwner(item)) {
      setItemToEdit(item);
    }
  };

  // Enhanced delete handler
  const handleDelete = async (item: GoodsExchangeItem) => {
    // Only allow deletion if user owns the item
    if (isOwner(item) && onDeleteItem) {
      await onDeleteItem(item);
    }
  };

  const handleCloseEdit = () => {
    setItemToEdit(null);
  };
  
  return (
    <div className="w-full">
      {/* Grid layout with fixed-width cards that wrap naturally */}
      <div className="flex flex-wrap gap-4 justify-start">
        {goodsItems.map((item) => (
          <AvailableGoodsCard
            key={item.id}
            item={item}
            onClick={() => {
              // Items now use side panel navigation
              // The actual navigation will be handled by the page controller
            }}
          />
        ))}
      </div>


      <UniversalDialog
        open={!!itemToEdit}
        onOpenChange={handleCloseEdit}
        title="Edit Item"
      >
        {itemToEdit && (
          <GoodsForm
            onClose={handleCloseEdit}
            mode="edit"
            initialValues={{
              title: itemToEdit.title,
              description: itemToEdit.description || "",
              category: (itemToEdit.goods_category as GoodsItemCategory) || "furniture",
              requestType: itemToEdit.request_type === "need" ? "need" : "offer",
              images: itemToEdit.images || [],
              availableDays: itemToEdit.request_type === "offer" ? 30 : undefined,
              urgency: itemToEdit.urgency || "medium"
            }}
            requestId={itemToEdit.id}
            initialRequestType={itemToEdit.request_type as "need" | "offer"}
            forceDefaultDisplay={true}
          />
        )}
      </UniversalDialog>
    </div>
  );
};

export default AvailableItemsSection;
