
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { ModuleItemCard } from '@/components/ui/card/index';
import RequestGoodsCard from './RequestGoodsCard';
import OfferGoodsCard from './OfferGoodsCard';

/**
 * GoodsCard Component
 * 
 * This component renders different card types based on the item's request_type
 * and wraps them with the ModuleItemCard for consistent highlighting
 * and styling across the application.
 */
interface GoodsCardProps {
  item: GoodsExchangeItem;
  onSelect: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isDeletingItem?: boolean;
  isHighlighted?: boolean;
}

const GoodsCard: React.FC<GoodsCardProps> = ({
  item,
  onSelect,
  onDelete,
  onEdit,
  isDeletingItem = false,
  isHighlighted = false
}) => {
  // Determine if this item is an offer or request
  const isOffer = item.request_type === 'offer';
  
  return (
    <ModuleItemCard
      itemId={item.id}
      itemType="goods"
      isHighlighted={isHighlighted}
      className="p-0 overflow-hidden" // Remove padding since the child cards have their own padding
    >
      {isOffer ? (
        // For offered items, render the offer card
        <OfferGoodsCard 
          item={item}
          onSelect={onSelect}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeletingItem={isDeletingItem}
        />
      ) : (
        // For requested items, render the request card
        <RequestGoodsCard 
          item={item}
          onSelect={onSelect}
          urgency={item.urgency}
        />
      )}
    </ModuleItemCard>
  );
};

export default GoodsCard;
