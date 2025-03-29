
import { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { GoodsItemCategory } from '@/components/support/types/formTypes';

// Import Components
import UrgentRequestsSection from "./UrgentRequestsSection";
import AvailableItemsSection from "./AvailableItemsSection";
import GoodsRequestsSection from "./GoodsRequestsSection";

// Import Helpers
import { getUrgencyClass, getUrgencyLabel } from "./utils/urgencyHelpers";

/**
 * Props interface for the GoodsSections component
 */
interface GoodsSectionsProps {
  // Data and loading state
  goodsData: GoodsExchangeItem[] | undefined;
  isLoading: boolean;
  
  // Search and filter states
  searchQuery: string;
  showUrgent: boolean;
  showRequests: boolean;
  showAvailable: boolean;
  
  // Event handlers
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onOfferItem: () => void;
  onRequestItem: () => void;
  onRefresh: () => void;
}

/**
 * GoodsSections component
 * 
 * This component organizes all the different sections of the Goods page:
 * - Urgent requests at the top
 * - Regular requests section
 * - Available items section
 */
const GoodsSections = ({
  goodsData,
  isLoading,
  searchQuery,
  showUrgent,
  showRequests,
  showAvailable,
  onRequestSelect,
  onOfferItem,
  onRequestItem,
  onRefresh
}: GoodsSectionsProps) => {
  // State for category filters
  const [categoryFilters, setCategoryFilters] = useState<GoodsItemCategory[]>([]);

  // If data is loading or no data is available, handle these states
  if (isLoading) {
    return <div className="py-10 text-center">Loading goods exchange items...</div>;
  }

  if (!goodsData || goodsData.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">No goods exchange items found.</p>
        <div className="mt-4 flex justify-center gap-4">
          <button 
            onClick={onRequestItem}
            className="px-4 py-2 bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900 rounded-md"
          >
            Request Item
          </button>
          <button
            onClick={onOfferItem} 
            className="px-4 py-2 bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900 rounded-md"
          >
            Offer Item
          </button>
        </div>
      </div>
    );
  }
  
  // Filter data based on search query and display settings
  const filteredData = goodsData.filter(item => {
    // Search filter - check if search query matches title or description
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilters.length === 0 || 
      (item.goods_category && categoryFilters.includes(item.goods_category as GoodsItemCategory));
      
    return matchesSearch && matchesCategory;
  });

  // Separate items into different sections based on type and urgency
  const urgentRequests = showUrgent ? filteredData.filter(item => 
    item.request_type === 'need' && item.urgency === 'high'
  ) : [];
  
  const regularRequests = showRequests ? filteredData.filter(item => 
    item.request_type === 'need' && item.urgency !== 'high'
  ) : [];
  
  const availableItems = showAvailable ? filteredData.filter(item => 
    item.request_type === 'offer'
  ) : [];

  return (
    <>
      {/* Only show urgent section if we have urgent requests and showUrgent is true */}
      {showUrgent && urgentRequests.length > 0 && (
        <UrgentRequestsSection 
          urgentRequests={urgentRequests}
          onRequestSelect={onRequestSelect}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
        />
      )}

      {/* Only show goods requests section if we have requests and showRequests is true */}
      {showRequests && regularRequests.length > 0 && (
        <GoodsRequestsSection 
          goodsRequests={regularRequests}
          urgentRequests={urgentRequests}
          onRequestSelect={onRequestSelect}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
        />
      )}
      
      {/* Only show available items section if we have items and showAvailable is true */}
      {showAvailable && (
        <AvailableItemsSection 
          goodsItems={availableItems}
          onRequestSelect={onRequestSelect}
          onNewOffer={onOfferItem}
          onRefetch={onRefresh}
        />
      )}
    </>
  );
};

export default GoodsSections;
