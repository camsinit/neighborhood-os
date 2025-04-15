import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import RequestDetailCard from './components/RequestDetailCard';
import UniversalDialog from "@/components/ui/universal-dialog";
import GoodsForm from './GoodsForm';
import { useToast } from "@/hooks/use-toast";
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import { supabase } from "@/integrations/supabase/client";

/**
 * AvailableItemsSection component displays available goods items in a grid format
 * with images displayed at full height on the left side of each card
 */
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
  onDeleteItem,
  isDeletingItem = false,
  onRefetch
}) => {
  // State to track which popover is currently open
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // State to track the item being edited
  const [itemToEdit, setItemToEdit] = useState<GoodsExchangeItem | null>(null);

  // Use the toast hook for notifications
  const {
    toast
  } = useToast();

  // Handle item edit - opens the edit dialog
  const handleEdit = (item: GoodsExchangeItem) => {
    setItemToEdit(item);
  };

  // Handle closing the edit dialog
  const handleCloseEdit = () => {
    setItemToEdit(null);
  };
  return <div className="w-full">
      <div className="space-y-2">
        {goodsItems.map(item => <Popover key={item.id} open={openPopoverId === item.id} onOpenChange={open => setOpenPopoverId(open ? item.id : null)}>
            <PopoverTrigger asChild>
              <div className="w-full flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group">
                {/* Image preview on the left */}
                {(item.image_url || item.images && item.images.length > 0) && <div className="w-32 h-full flex-shrink-0">
                    <img src={item.image_url || item.images?.[0]} alt={item.title} className="h-full w-full object-cover rounded-l-lg" />
                  </div>}
                
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
                  
                  {/* Edit and Delete buttons for owner */}
                  <div className="flex gap-2 ml-4">
                    
                    {onDeleteItem}
                  </div>
                </div>
              </div>
            </PopoverTrigger>
            
            {/* Popover content */}
            <PopoverContent className="w-[300px] p-0" sideOffset={5}>
              <RequestDetailCard request={item} getUrgencyClass={() => ''} getUrgencyLabel={() => ''} onDeleteItem={onDeleteItem} isDeletingItem={isDeletingItem} onEdit={() => handleEdit(item)} />
            </PopoverContent>
          </Popover>)}
      </div>

      {/* Edit Dialog */}
      <UniversalDialog open={!!itemToEdit} onOpenChange={handleCloseEdit} title="Edit Item">
        {itemToEdit && <GoodsForm onClose={handleCloseEdit} mode="edit" initialValues={{
        title: itemToEdit.title,
        description: itemToEdit.description || "",
        // Here's the fix: we need to cast goods_category to GoodsItemCategory
        category: itemToEdit.goods_category as GoodsItemCategory || "furniture",
        // We need requestType, not request_type
        requestType: itemToEdit.request_type === "need" ? "need" : "offer",
        images: itemToEdit.images || [],
        // Fix: Use images array instead of image_url - image_url is not recognized in the form data type
        // Only add the first image from image_url to the images array if it exists and images is empty
        ...(itemToEdit.image_url && (!itemToEdit.images || itemToEdit.images.length === 0) ? {
          images: [itemToEdit.image_url]
        } : {})
      }} requestId={itemToEdit.id} initialRequestType={itemToEdit.request_type} />}
      </UniversalDialog>
    </div>;
};
export default AvailableItemsSection;