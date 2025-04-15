import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestActionsButton from './components/RequestActionsButton';

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
  isDeletingItem = false
}) => {
  // Keep track of which popover is currently open
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

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
              <div className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group">
                {/* Profile and title section */}
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

                {/* Image preview on the right */}
                {(item.image_url || (item.images && item.images.length > 0)) && (
                  <div className="w-16 h-16 ml-4 flex-shrink-0">
                    <img 
                      src={item.image_url || item.images?.[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
                
                {/* Action buttons */}
                <RequestActionsButton 
                  request={item}
                  onDeleteItem={onDeleteItem}
                  isDeletingItem={isDeletingItem}
                />
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
              />
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
};

export default AvailableItemsSection;
