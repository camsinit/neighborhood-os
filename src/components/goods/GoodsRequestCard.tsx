
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import RequestGoodsCard from './cards/RequestGoodsCard';

interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  onSelect: (request: GoodsExchangeItem) => void;
}

/**
 * GoodsRequestCard - Simplified card component for goods requests
 * 
 * Updated to work with the new centered modal dialog approach
 * instead of using individual popovers for each card.
 */
const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
  request,
  onSelect
}) => {
  return (
    <RequestGoodsCard
      request={request}
      onSelect={() => onSelect(request)}
    />
  );
};

export default GoodsRequestCard;
