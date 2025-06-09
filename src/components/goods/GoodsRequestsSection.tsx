
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
 * Updated to display requests using the new GoodsRequestCard interface
 * which handles its own modal dialog state internally.
 */
const GoodsRequestsSection: React.FC<GoodsRequestsSectionProps> = ({
  requests,
  onDeleteItem,
  isDeletingItem = false
}) => {
  // Handler for when a request is selected - this will be passed to the card
  const handleRequestSelect = (request: GoodsExchangeItem) => {
    // The card will handle opening its own modal dialog
    console.log('Request selected:', request.id);
  };

  return (
    <div className="w-full">
      {/* Grid layout with fixed-width cards that wrap naturally */}
      <div className="flex flex-wrap gap-4 justify-start">
        {requests.map((request) => (
          <GoodsRequestCard
            key={request.id}
            request={request}
            onSelect={handleRequestSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default GoodsRequestsSection;
