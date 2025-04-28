
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { filterBySearch } from './utils/sectionHelpers';
import { getUrgencyClass, getUrgencyLabel } from './utils/urgencyHelpers';
import { useGoodsItemDeletion } from './hooks/useGoodsItemDeletion';
import { GoodsSectionsLoadingState } from './states/EmptyAndLoadingStates';
import { TabsContent } from "@/components/ui/tabs";
import UrgentGoodsSection from './sections/UrgentGoodsSection';
import RegularGoodsSection from './sections/RegularGoodsSection';
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import GoodsSearchBar from './GoodsSearchBar';

interface GoodsSectionsProps {
  goodsData: GoodsExchangeItem[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showUrgent: boolean;
  showRequests: boolean;
  showAvailable: boolean;
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onRefresh: () => void;
  onOfferItem: () => void;
  onRequestItem: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  onSearchChange,
  showUrgent,
  showRequests,
  showAvailable,
  onRequestSelect,
  onRefresh,
  onOfferItem,
  onRequestItem,
  activeTab,
  onTabChange
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
    <>
      {/* Search bar and filter controls */}
      <GoodsSearchBar 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onRequestItem={onRequestItem}
        onOfferItem={onOfferItem}
        activeTab={activeTab}
        onTabChange={onTabChange}
        goodsItems={available}
        onDeleteItem={handleDeleteGoodsItem}
        isDeletingItem={isDeletingItem}
        onRefetch={onRefresh}
      />

      {/* Needs tab content */}
      <TabsContent value="needs" className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg space-y-4">
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
    </>
  );
};

export default GoodsSections;
