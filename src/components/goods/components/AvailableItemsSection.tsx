
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import RequestDetailCard from './RequestDetailCard';
import { Link } from "react-router-dom";
import UniversalDialog from "@/components/ui/universal-dialog";
import GoodsForm from '../GoodsForm';
import { useToast } from "@/hooks/use-toast";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

/**
 * This component displays a section of available items with edit/delete functionality
 * for authorized users (item owners)
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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<GoodsExchangeItem | null>(null);
  const { toast } = useToast();

  const handleEdit = (item: GoodsExchangeItem) => {
    setItemToEdit(item);
  };

  const handleCloseEdit = () => {
    setItemToEdit(null);
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
                  <div className="w-32 h-full flex-shrink-0">
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
                  
                  {/* Edit and Delete buttons for owner */}
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      Edit
                    </Button>
                    {onDeleteItem && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                        }}
                        disabled={isDeletingItem}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </PopoverTrigger>
            
            {/* Popover content */}
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

      {/* Edit Dialog */}
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
              // Cast to GoodsItemCategory and use the correct property
              category: (itemToEdit.goods_category as GoodsItemCategory) || "furniture",
              // Use requestType (not request_type) to match the expected interface
              requestType: itemToEdit.request_type === "need" ? "need" : "offer",
              // Include all images if available
              images: itemToEdit.images || [],
              // Include availableDays for offers (default to 30 if not available)
              availableDays: itemToEdit.request_type === "offer" ? 30 : undefined,
              // Include urgency for requests
              urgency: itemToEdit.urgency || "medium"
            }}
            requestId={itemToEdit.id}
            // Pass the initialRequestType to ensure the correct form type is shown
            initialRequestType={itemToEdit.request_type as "need" | "offer"}
            // Force the display layout to always match new offer/request
            forceDefaultDisplay={true}
          />
        )}
      </UniversalDialog>
    </div>
  );
};

export default AvailableItemsSection;
