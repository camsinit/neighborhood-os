
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestCard from './GoodsRequestCard';

interface GoodsRequestsSectionProps {
  requests: GoodsExchangeItem[];
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

/**
 * GoodsRequestsSection - Section for displaying goods requests
 * 
 * Updated to display requests in a 3-column grid layout with square cards
 */
const GoodsRequestsSection: React.FC<GoodsRequestsSectionProps> = ({
  requests,
  onDeleteItem,
  isDeletingItem = false
}) => {
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Grid layout with 3 columns for square cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <GoodsRequestCard
            key={request.id}
            request={request}
            isOpen={openRequestId === request.id}
            onOpenChange={(open) => setOpenRequestId(open ? request.id : null)}
            onDeleteItem={onDeleteItem}
            isDeletingItem={isDeletingItem}
          />
        ))}
      </div>
    </div>
  );
};

export default GoodsRequestsSection;
