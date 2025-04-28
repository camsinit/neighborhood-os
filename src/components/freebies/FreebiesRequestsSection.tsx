
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import FreebiesRequestCard from './FreebiesRequestCard';

interface FreebiesRequestsSectionProps {
  freebiesRequests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: React.Dispatch<React.SetStateAction<GoodsExchangeItem | null>>;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const FreebiesRequestsSection: React.FC<FreebiesRequestsSectionProps> = ({ 
  freebiesRequests, 
  urgentRequests,
  onRequestSelect,
  onDeleteItem,
  isDeletingItem = false
}) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // Filter out regular requests by excluding urgent ones
  const regularRequests = freebiesRequests.filter(
    req => !urgentRequests.some(urgentReq => urgentReq.id === req.id)
  );
  
  if (regularRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {regularRequests.map((request) => (
        <FreebiesRequestCard
          key={request.id}
          request={request}
          isOpen={openPopoverId === request.id}
          onOpenChange={(open) => {
            setOpenPopoverId(open ? request.id : null);
          }}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      ))}
    </div>
  );
};

export default FreebiesRequestsSection;
