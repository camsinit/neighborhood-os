
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Dialog, DialogContent } from "@/components/ui/dialog";

import RequestGoodsCard from '../cards/RequestGoodsCard';
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import { useUser } from '@supabase/auth-helpers-react';

interface RegularGoodsSectionProps {
  requests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  showRequests: boolean;
  onRequestItem: () => void;
  selectedRequest: GoodsExchangeItem | null;
  onSelectedRequestChange: (request: GoodsExchangeItem | null) => void;
}

/**
 * RegularGoodsSection - Section for displaying regular (non-urgent) goods requests
 * 
 * Updated to use a centered modal dialog and maintain compact card sizing
 * with flex-wrap layout for better responsive behavior.
 * Now properly closes dialog when item is deleted.
 */
const RegularGoodsSection: React.FC<RegularGoodsSectionProps> = ({
  requests,
  urgentRequests,
  onRequestSelect,
  onDeleteItem,
  isDeletingItem = false,
  showRequests,
  onRequestItem,
  selectedRequest,
  onSelectedRequestChange
}) => {
  // Get current user to check ownership
  const user = useUser();

  // Function to check if current user owns the item
  const isOwner = (item: GoodsExchangeItem) => {
    return user?.id === item.user_id;
  };

  // Handle edit function - only allow if user owns the item
  const handleEdit = (item: GoodsExchangeItem) => {
    if (isOwner(item)) {
      // Edit functionality would be handled by parent component
      console.log('Edit requested for item:', item.id);
    }
  };

  // Enhanced delete handler that closes the dialog after deletion
  const handleDelete = async (item: GoodsExchangeItem) => {
    if (onDeleteItem) {
      await onDeleteItem(item);
      // Close the dialog after successful deletion
      onSelectedRequestChange(null);
    }
  };

  if (!showRequests) return null;

  return (
    <div className="space-y-4">
      {requests.length > 0 ? (
        <>
          {/* Grid layout with fixed-width cards that wrap naturally */}
          <div className="flex flex-wrap gap-4 justify-start">
            {requests.map((request) => (
              <RequestGoodsCard
                key={request.id}
                request={request}
                onSelect={() => onSelectedRequestChange(request)}
              />
            ))}
          </div>

        </>
      ) : urgentRequests.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No Requests Yet"
          description="Be the first to request an item from your neighbors"
          actionLabel="Request an Item"
          onAction={onRequestItem}
          moduleTheme="goods"
        />
      ) : null}
    </div>
  );
};

export default RegularGoodsSection;
