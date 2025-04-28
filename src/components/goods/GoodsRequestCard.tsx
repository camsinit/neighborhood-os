
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestGoodsCard from './cards/RequestGoodsCard';

interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
  request,
  isOpen,
  onOpenChange,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <RequestGoodsCard
            request={request}
            getUrgencyClass={getUrgencyClass}
            getUrgencyLabel={getUrgencyLabel}
            onSelect={() => onOpenChange(true)}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <RequestDetailCard
          request={request}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      </PopoverContent>
    </Popover>
  );
};

export default GoodsRequestCard;
