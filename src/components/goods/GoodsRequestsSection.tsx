
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestCard from './GoodsRequestCard';

interface GoodsRequestsSectionProps {
  goodsRequests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: React.Dispatch<React.SetStateAction<GoodsExchangeItem | null>>;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const GoodsRequestsSection: React.FC<GoodsRequestsSectionProps> = ({ 
  goodsRequests, 
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // Filter out regular requests by excluding urgent ones
  const regularRequests = goodsRequests.filter(
    req => !urgentRequests.some(urgentReq => urgentReq.id === req.id)
  );
  
  if (regularRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {regularRequests.map((request) => (
        <GoodsRequestCard
          key={request.id}
          request={request}
          isOpen={openPopoverId === request.id}
          onOpenChange={(open) => {
            setOpenPopoverId(open ? request.id : null);
          }}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      ))}
    </div>
  );
};

export default GoodsRequestsSection;
