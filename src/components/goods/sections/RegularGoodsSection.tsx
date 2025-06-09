
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestCard from '../GoodsRequestCard';
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";

interface RegularGoodsSectionProps {
  requests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  showRequests: boolean;
  onRequestItem: () => void;
}

/**
 * RegularGoodsSection - Section for displaying regular (non-urgent) goods requests
 * 
 * Updated to display requests in a grid with fixed-size cards that open popovers when clicked.
 */
const RegularGoodsSection: React.FC<RegularGoodsSectionProps> = ({
  requests,
  urgentRequests,
  onRequestSelect,
  onDeleteItem,
  isDeletingItem = false,
  showRequests,
  onRequestItem
}) => {
  if (!showRequests || requests.length === 0) {
    if (urgentRequests.length === 0) {
      return (
        <EmptyState
          icon={PackageSearch}
          title="No Requests Yet"
          description="Be the first to request an item from your neighbors"
          actionLabel="Request an Item"
          onAction={onRequestItem}
        />
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Item Requests</h3>
      
      {/* Grid layout with fixed-size cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-start">
        {requests.map((request) => (
          <GoodsRequestCard
            key={request.id}
            request={request}
            isOpen={false}
            onOpenChange={() => {}}
            onDeleteItem={onDeleteItem}
            isDeletingItem={isDeletingItem}
          />
        ))}
      </div>
    </div>
  );
};

export default RegularGoodsSection;
