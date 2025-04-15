
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import UrgentRequestsSection from '../UrgentRequestsSection';

interface UrgentGoodsSectionProps {
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  showUrgent: boolean;
}

const UrgentGoodsSection: React.FC<UrgentGoodsSectionProps> = ({
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
  showUrgent
}) => {
  if (!showUrgent || urgentRequests.length === 0) return null;

  return (
    <UrgentRequestsSection 
      urgentRequests={urgentRequests} 
      onRequestSelect={onRequestSelect} 
      getUrgencyClass={getUrgencyClass} 
      getUrgencyLabel={getUrgencyLabel} 
    />
  );
};

export default UrgentGoodsSection;
