
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import UniversalDialog from "@/components/ui/universal-dialog";
import FreebiesForm from './FreebiesForm';
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import AvailableFreebiesCard from './cards/AvailableFreebiesCard';

interface AvailableFreebiesSectionProps {
  freebiesItems: GoodsExchangeItem[];
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onRefetch: () => void;
}

const AvailableFreebiesSection: React.FC<AvailableFreebiesSectionProps> = ({
  freebiesItems,
  onDeleteItem,
  isDeletingItem = false,
  onRefetch
}) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<GoodsExchangeItem | null>(null);

  const handleEdit = (item: GoodsExchangeItem) => {
    setItemToEdit(item);
  };

  const handleCloseEdit = () => {
    setItemToEdit(null);
  };
  
  return (
    <div className="w-full">
      <div className="space-y-4">
        {freebiesItems.map((item) => (
          <Popover 
            key={item.id}
            open={openPopoverId === item.id}
            onOpenChange={(open) => setOpenPopoverId(open ? item.id : null)}
          >
            <PopoverTrigger asChild>
              <div>
                <AvailableFreebiesCard
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => onDeleteItem?.(item)}
                  isDeletingItem={isDeletingItem}
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
              />
            </PopoverContent>
          </Popover>
        ))}
      </div>

      <UniversalDialog
        open={!!itemToEdit}
        onOpenChange={handleCloseEdit}
        title="Edit Freebie"
      >
        {itemToEdit && (
          <FreebiesForm
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

export default AvailableFreebiesSection;
