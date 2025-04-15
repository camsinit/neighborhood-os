
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestsSection from '../GoodsRequestsSection';
import { Button } from "@/components/ui/button";

interface RegularGoodsSectionProps {
  requests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem: boolean;
  showRequests: boolean;
  onRequestItem: () => void;
}

const RegularGoodsSection: React.FC<RegularGoodsSectionProps> = ({
  requests,
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem,
  showRequests,
  onRequestItem
}) => {
  if (!showRequests) return null;
  
  const hasRequests = requests.length > 0 || urgentRequests.length > 0;
  
  if (!hasRequests) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Requests from Neighbors</h2>
        <Button variant="outline" onClick={onRequestItem}>
          Request an Item
        </Button>
      </div>
      
      <GoodsRequestsSection 
        goodsRequests={requests} 
        urgentRequests={urgentRequests} 
        onRequestSelect={onRequestSelect} 
        getUrgencyClass={getUrgencyClass} 
        getUrgencyLabel={getUrgencyLabel} 
        onDeleteItem={onDeleteItem}
        isDeletingItem={isDeletingItem}
      />
    </div>
  );
};

export default RegularGoodsSection;
