
import { Dispatch, SetStateAction, useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { GoodsItemCategory } from '@/components/support/types/formTypes';

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
 * - Regular requests section (moved up above available items)
 * - Available items section
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
  // State to store selected category filters
  const [categoryFilters, setCategoryFilters] = useState<GoodsItemCategory[]>([]);
  
  // Apply category filters to goods items
  const filteredGoodsItems = categoryFilters.length === 0
    ? goodsItems // If no filters selected, show all items
    : goodsItems.filter(item => 
        item.goods_category && categoryFilters.includes(item.goods_category as GoodsItemCategory)
      );
  
  // Apply category filters to goods requests
  const filteredGoodsRequests = categoryFilters.length === 0
    ? goodsRequests // If no filters selected, show all requests
    : goodsRequests.filter(item => 
        item.goods_category && categoryFilters.includes(item.goods_category as GoodsItemCategory)
      );
  
  // Apply category filters to urgent requests
  const filteredUrgentRequests = categoryFilters.length === 0
    ? urgentRequests // If no filters selected, show all urgent requests
    : urgentRequests.filter(item => 
        item.goods_category && categoryFilters.includes(item.goods_category as GoodsItemCategory)
      );

  return (
    <>
      {/* Urgent requests section - Shows high-priority needs */}
      <UrgentRequestsSection 
        urgentRequests={filteredUrgentRequests}
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
          onCategoryFilter={setCategoryFilters}
        />

        {/* Non-urgent requests section - Shows regular needs (now above available items) */}
        <GoodsRequestsSection 
          goodsRequests={filteredGoodsRequests}
          urgentRequests={urgentRequests}
          onRequestSelect={onRequestSelect}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
        />
        
        {/* Available items section - Shows offers from neighbors (now below requests) */}
        <AvailableItemsSection 
          goodsItems={filteredGoodsItems}
          onRequestSelect={onRequestSelect}
          onNewOffer={onOfferItem}
          onRefetch={onRefresh}
        />
      </div>
    </>
  );
};

export default GoodsSections;
