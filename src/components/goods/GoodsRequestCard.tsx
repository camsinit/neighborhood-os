
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestGoodsCard from './cards/RequestGoodsCard';

/**
 * GoodsRequestCard Component
 * 
 * This component wraps a RequestGoodsCard with a popover for showing details
 */
interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
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
          <RequestGoodsCard
            item={request} {/* Changed from 'request' to 'item' to match prop interface */}
            onSelect={() => onOpenChange(true)}
            urgency={request.urgency}
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

export default GoodsRequestCard;
