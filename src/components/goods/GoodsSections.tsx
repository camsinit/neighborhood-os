
import React, { useState } from 'react';
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
  // State for managing which request is selected for the modal dialog
  const [selectedRequest, setSelectedRequest] = useState<GoodsExchangeItem | null>(null);

  // Enhanced deletion hook with callback to close dialogs
  const {
    handleDeleteGoodsItem,
    isDeletingItem
  } = useGoodsItemDeletion(onRefresh, () => setSelectedRequest(null));

  const filteredGoods = filterBySearch(goodsData || [], searchQuery);
  const urgentRequests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency === 'high');
  const requests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency !== 'high');
  const available = filteredGoods.filter(item => item.request_type === 'offer');

  if (isLoading) {
    return <GoodsSectionsLoadingState />;
  }

  return (
    <div className="space-y-6">
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
      <TabsContent value="needs" className="w-full">
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
              onRequestSelect={setSelectedRequest}
              getUrgencyClass={getUrgencyClass}
              getUrgencyLabel={getUrgencyLabel}
              showUrgent={showUrgent}
            />
            <RegularGoodsSection 
              requests={requests}
              urgentRequests={urgentRequests}
              onRequestSelect={setSelectedRequest}
              onDeleteItem={handleDeleteGoodsItem}
              isDeletingItem={isDeletingItem}
              showRequests={showRequests}
              onRequestItem={onRequestItem}
              selectedRequest={selectedRequest}
              onSelectedRequestChange={setSelectedRequest}
            />
          </>
        )}
      </TabsContent>
    </div>
  );
};

export default GoodsSections;
