
import { Dispatch, SetStateAction } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';

// Import Components
import UrgentRequestsSection from "./UrgentRequestsSection";
import AvailableItemsSection from "./AvailableItemsSection";
import GoodsRequestsSection from "./GoodsRequestsSection";
import GoodsSearchBar from "./GoodsSearchBar";

// Import Helpers
import { getUrgencyClass, getUrgencyLabel } from "./utils/urgencyHelpers";

/**
 * Props interface for the GoodsSections component
 */
interface GoodsSectionsProps {
  urgentRequests: GoodsExchangeItem[];
  goodsRequests: GoodsExchangeItem[];
  goodsItems: GoodsExchangeItem[];
  onRequestSelect: Dispatch<SetStateAction<GoodsExchangeItem | null>>;
  onOfferItem: () => void;
  onRequestItem: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

/**
 * GoodsSections component
 * 
 * This component organizes all the different sections of the Goods page:
 * - Urgent requests at the top
 * - Search bar and action buttons
 * - Available items section
 * - Regular requests section
 */
const GoodsSections = ({
  urgentRequests,
  goodsRequests,
  goodsItems,
  onRequestSelect,
  onOfferItem,
  onRequestItem,
  searchQuery,
  onSearchChange,
  onRefresh
}: GoodsSectionsProps) => {
  return (
    <>
      {/* Urgent requests section - Shows high-priority needs */}
      <UrgentRequestsSection 
        urgentRequests={urgentRequests}
        onRequestSelect={onRequestSelect}
        getUrgencyClass={getUrgencyClass}
        getUrgencyLabel={getUrgencyLabel}
      />

      {/* Main content section - Contains search, action buttons, and items */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        {/* Search bar and action buttons */}
        <GoodsSearchBar 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRequestItem={onRequestItem}
          onOfferItem={onOfferItem}
        />

        {/* Available items section - Shows offers from neighbors */}
        <AvailableItemsSection 
          goodsItems={goodsItems}
          onRequestSelect={onRequestSelect}
          onNewOffer={onOfferItem}
          onRefetch={onRefresh}
        />
        
        {/* Non-urgent requests section - Shows regular needs */}
        <GoodsRequestsSection 
          goodsRequests={goodsRequests}
          urgentRequests={urgentRequests}
          onRequestSelect={onRequestSelect}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
        />
      </div>
    </>
  );
};

export default GoodsSections;
