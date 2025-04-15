
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { filterBySearch } from './utils/sectionHelpers';
import { useGoodsItemDeletion } from './hooks/useGoodsItemDeletion';
import { GoodsSectionsLoadingState } from './states/EmptyAndLoadingStates';
import { TabsContent } from "@/components/ui/tabs";
import UrgentGoodsSection from './sections/UrgentGoodsSection';
import RegularGoodsSection from './sections/RegularGoodsSection';
import AvailableItemsSection from './AvailableItemsSection';

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

  // Get categorized goods
  const filteredGoods = filterBySearch(goodsData || [], searchQuery);
  const urgentRequests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency === 'high');
  const requests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency !== 'high');
  const available = filteredGoods.filter(item => item.request_type === 'offer');

  if (isLoading) {
    return <GoodsSectionsLoadingState />;
  }

  return (
    <div>
      {/* Tab content for "All Items" view */}
      <TabsContent value="all" className="space-y-8">
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

        {showAvailable && (
          <div className="mt-10">
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

      {/* Tab content for "Requests" view */}
      <TabsContent value="needs">
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
      </TabsContent>

      {/* Tab content for "Available" view */}
      <TabsContent value="offers">
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
      </TabsContent>
    </div>
  );
};

export default GoodsSections;
