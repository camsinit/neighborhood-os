import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { filterBySearch } from './utils/sectionHelpers';
import { getUrgencyClass, getUrgencyLabel } from './utils/urgencyHelpers';
import { useGoodsItemDeletion } from './hooks/useGoodsItemDeletion';
import { GoodsSectionsLoadingState } from './states/EmptyAndLoadingStates';
import { TabsContent } from "@/components/ui/tabs";
import UrgentGoodsSection from './sections/UrgentGoodsSection';
import RegularGoodsSection from './sections/RegularGoodsSection';
import AvailableItemsSection from './AvailableItemsSection';
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch, Gift } from "lucide-react";

interface GoodsSectionsProps {
  goodsData: GoodsExchangeItem[];
  isLoading: boolean;
  searchQuery: string;
  showUrgent: boolean;
  showRequests: boolean;
  showAvailable: boolean;
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onRefresh: () => void;
  onOfferItem: () => void;
  onRequestItem: () => void;
  activeTab: string;
}

/**
 * GoodsSections component
 * 
 * This component manages the display of different sections of goods items:
 * - Urgent requests (high priority needs)
 * - Regular requests (normal priority needs)
 * - Available items (things neighbors are offering)
 * 
 * It also handles filtering, loading states, and passes appropriate props
 * to each section component.
 */
const GoodsSections: React.FC<GoodsSectionsProps> = ({
  goodsData = [],
  isLoading,
  searchQuery,
  showUrgent,
  showRequests,
  showAvailable,
  onRequestSelect,
  onRefresh,
  onOfferItem,
  onRequestItem,
  activeTab
}) => {
  const {
    handleDeleteGoodsItem,
    isDeletingItem
  } = useGoodsItemDeletion(onRefresh);

  const filteredGoods = filterBySearch(goodsData || [], searchQuery);
  const urgentRequests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency === 'high');
  const requests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency !== 'high');
  const available = filteredGoods.filter(item => item.request_type === 'offer');

  if (isLoading) {
    return <GoodsSectionsLoadingState />;
  }

  return (
    <div>
      {/* Tab content for "Requests" view */}
      <TabsContent value="needs" className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        {requests.length === 0 && urgentRequests.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No Requests Yet"
            description="Be the first to request an item from your neighbors"
            actionLabel="Request an Item"
            onAction={onRequestItem}
          />
        ) : (
          <>
            <UrgentGoodsSection 
              urgentRequests={urgentRequests}
              onRequestSelect={onRequestSelect}
              getUrgencyClass={getUrgencyClass}
              getUrgencyLabel={getUrgencyLabel}
              showUrgent={showUrgent}
            />
            <RegularGoodsSection 
              requests={requests}
              urgentRequests={urgentRequests}
              onRequestSelect={onRequestSelect}
              getUrgencyClass={getUrgencyClass}
              getUrgencyLabel={getUrgencyLabel}
              onDeleteItem={handleDeleteGoodsItem}
              isDeletingItem={isDeletingItem}
              showRequests={showRequests}
              onRequestItem={onRequestItem}
            />
          </>
        )}
      </TabsContent>

      {/* Tab content for "Available" view */}
      <TabsContent value="offers" className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        {available.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No Items Available"
            description="Be the first to share an item with your neighbors"
            actionLabel="Offer an Item"
            onAction={onOfferItem}
          />
        ) : (
          <div className="mt-4">
            <AvailableItemsSection 
              goodsItems={available}
              onRequestSelect={onRequestSelect}
              onNewOffer={onOfferItem}
              onRefetch={onRefresh}
              onDeleteItem={handleDeleteGoodsItem}
              isDeletingItem={isDeletingItem}
            />
          </div>
        )}
      </TabsContent>
    </div>
  );
};

export default GoodsSections;
