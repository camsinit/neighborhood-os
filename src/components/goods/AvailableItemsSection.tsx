
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestActionsButton from './components/RequestActionsButton';
import ItemRequestDialog from '@/components/items/dialogs/ItemRequestDialog';

interface AvailableItemsSectionProps {
  goodsItems: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onNewOffer: () => void;
  onRefetch: () => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const AvailableItemsSection: React.FC<AvailableItemsSectionProps> = ({
  goodsItems,
  onRequestSelect,
  onDeleteItem,
  isDeletingItem = false,
  onRefetch
}) => {
  // Keep track of which popover is currently open
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<GoodsExchangeItem | null>(null);

  // Handle item update
  const handleUpdate = async (updatedRequest: GoodsExchangeItem) => {
    try {
      const { data } = await supabase
        .from('goods_exchange')
        .update({
          title: updatedRequest.title,
          description: updatedRequest.description
        })
        .eq('id', updatedRequest.id)
        .select();
      
      if (data) {
        onRefetch();
        toast.success('Item updated successfully');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-2">
        {goodsItems.map((item) => (
          <Popover 
            key={item.id}
            open={openPopoverId === item.id}
            onOpenChange={(open) => setOpenPopoverId(open ? item.id : null)}
          >
            <PopoverTrigger asChild>
              <div className="w-full flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group">
                {/* Image preview on the left */}
                {(item.image_url || (item.images && item.images.length > 0)) && (
                  <div className="w-32 flex-shrink-0">
                    <img 
                      src={item.image_url || item.images?.[0]} 
                      alt={item.title}
                      className="h-full w-full object-cover rounded-l-lg"
                    />
                  </div>
                )}
                
                {/* Content section */}
                <div className="flex-grow flex items-center p-4">
                  <div className="flex items-center gap-3 flex-grow">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {item.profiles?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <RequestActionsButton 
                    request={item}
                    onDeleteItem={onDeleteItem}
                    isDeletingItem={isDeletingItem}
                    onEdit={() => setItemToEdit(item)}
                  />
                </div>
              </div>
            </PopoverTrigger>
            
            {/* Popover content */}
            <PopoverContent className="w-[300px] p-0" sideOffset={5}>
              <RequestDetailCard
                request={item}
                getUrgencyClass={() => ''}
                getUrgencyLabel={() => ''}
                onDeleteItem={onDeleteItem}
                isDeletingItem={isDeletingItem}
                onEdit={() => setItemToEdit(item)}
              />
            </PopoverContent>
          </Popover>
        ))}
      </div>

      {/* Edit Dialog */}
      <ItemRequestDialog
        request={itemToEdit}
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default AvailableItemsSection;
