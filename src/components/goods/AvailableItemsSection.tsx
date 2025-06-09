
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
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
 * Updated to display items in a grid with fixed-size cards that don't grow with window size.
 * Each card opens a popover when clicked to show full details.
 */
const AvailableItemsSection: React.FC<AvailableItemsSectionProps> = ({
  goodsItems,
  onDeleteItem,
  isDeletingItem = false,
  onRefetch
}) => {
  // Get current user to check ownership
  const user = useUser();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
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

  const handleDelete = (item: GoodsExchangeItem) => {
    // Only allow deletion if user owns the item
    if (isOwner(item) && onDeleteItem) {
      onDeleteItem(item);
    }
  };

  const handleCloseEdit = () => {
    setItemToEdit(null);
  };
  
  return (
    <div className="w-full">
      {/* Grid layout with fixed-size cards that don't grow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-start">
        {goodsItems.map((item) => (
          <Popover 
            key={item.id}
            open={openPopoverId === item.id}
            onOpenChange={(open) => setOpenPopoverId(open ? item.id : null)}
          >
            <PopoverTrigger asChild>
              <div>
                <AvailableGoodsCard
                  item={item}
                  onClick={() => setOpenPopoverId(item.id)}
                />
              </div>
            </PopoverTrigger>
            
            <PopoverContent className="w-[300px] p-0" sideOffset={5}>
              <RequestDetailCard
                request={item}
                onDeleteItem={onDeleteItem}
                isDeletingItem={isDeletingItem}
                onEdit={() => handleEdit(item)}
                isOwner={isOwner(item)}
              />
            </PopoverContent>
          </Popover>
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
