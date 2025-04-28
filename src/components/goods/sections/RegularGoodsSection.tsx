
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestsSection from '../GoodsRequestsSection';

interface RegularGoodsSectionProps {
  requests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem: boolean;
  showRequests: boolean;
  onRequestItem: () => void;
}

const RegularGoodsSection: React.FC<RegularGoodsSectionProps> = ({
  requests,
  urgentRequests,
  onRequestSelect,
  onDeleteItem,
  isDeletingItem,
  showRequests
}) => {
  if (!showRequests) return null;
  
  const hasRequests = requests.length > 0 || urgentRequests.length > 0;
  
  if (!hasRequests) return null;

  return (
    <div className="space-y-2">
      <GoodsRequestsSection 
        goodsRequests={requests} 
        urgentRequests={urgentRequests} 
        onRequestSelect={onRequestSelect} 
        onDeleteItem={onDeleteItem}
        isDeletingItem={isDeletingItem}
      />
    </div>
  );
};

export default RegularGoodsSection;
