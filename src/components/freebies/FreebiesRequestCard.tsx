
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestFreebiesCard from './cards/RequestFreebiesCard';

interface FreebiesRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const FreebiesRequestCard: React.FC<FreebiesRequestCardProps> = ({
  request,
  isOpen,
  onOpenChange,
  onDeleteItem,
  isDeletingItem = false
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <RequestFreebiesCard
            request={request}
            onSelect={() => onOpenChange(true)}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <RequestDetailCard
          request={request}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      </PopoverContent>
    </Popover>
  );
};

export default FreebiesRequestCard;
