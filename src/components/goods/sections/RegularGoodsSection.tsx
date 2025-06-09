
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestsSection from '../GoodsRequestsSection';
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
 * This component handles the display of regular goods requests in a grid layout
 * and shows an empty state when no requests are available.
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
  if (!showRequests) return null;

  return (
    <div className="space-y-4">
      {requests.length > 0 ? (
        <GoodsRequestsSection
          requests={requests}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      ) : urgentRequests.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No Requests Yet"
          description="Be the first to request an item from your neighbors"
          actionLabel="Request an Item"
          onAction={onRequestItem}
        />
      ) : null}
    </div>
  );
};

export default RegularGoodsSection;
