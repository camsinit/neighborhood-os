
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { filterBySearch } from './utils/sectionHelpers';
import { getUrgencyClass, getUrgencyLabel } from './utils/urgencyHelpers';
import { useFreebiesItemDeletion } from './hooks/useFreebiesItemDeletion';
import { FreebiesSectionsLoadingState } from './states/EmptyAndLoadingStates';
import { TabsContent } from "@/components/ui/tabs";
import UrgentFreebiesSection from './sections/UrgentFreebiesSection';
import RegularFreebiesSection from './sections/RegularFreebiesSection';
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import FreebiesSearchBar from './FreebiesSearchBar';

interface FreebiesSectionsProps {
  freebiesData: GoodsExchangeItem[];
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

const FreebiesSections: React.FC<FreebiesSectionsProps> = ({
  freebiesData = [],
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
    handleDeleteFreebiesItem,
    isDeletingItem
  } = useFreebiesItemDeletion(onRefresh);

  const filteredFreebies = filterBySearch(freebiesData || [], searchQuery);
  const urgentRequests = filteredFreebies.filter(item => item.request_type === 'need' && item.urgency === 'high');
  const requests = filteredFreebies.filter(item => item.request_type === 'need' && item.urgency !== 'high');
  const available = filteredFreebies.filter(item => item.request_type === 'offer');

  if (isLoading) {
    return <FreebiesSectionsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <FreebiesSearchBar 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onRequestItem={onRequestItem}
        onOfferItem={onOfferItem}
        activeTab={activeTab}
        onTabChange={onTabChange}
        freebiesItems={available}
        onDeleteItem={handleDeleteFreebiesItem}
        isDeletingItem={isDeletingItem}
        onRefetch={onRefresh}
      />

      {/* Needs tab content - reset to minimal styling */}
      <TabsContent value="needs" className="w-full">
        {requests.length === 0 && urgentRequests.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No Requests Yet"
            description="Be the first to request a freebie from your neighbors"
            actionLabel="Request a Freebie"
            onAction={onRequestItem}
          />
        ) : (
          <>
            <UrgentFreebiesSection 
              urgentRequests={urgentRequests}
              onRequestSelect={onRequestSelect}
              getUrgencyClass={getUrgencyClass}
              getUrgencyLabel={getUrgencyLabel}
              showUrgent={showUrgent}
            />
            <RegularFreebiesSection 
              requests={requests}
              urgentRequests={urgentRequests}
              onRequestSelect={onRequestSelect}
              onDeleteItem={handleDeleteFreebiesItem}
              isDeletingItem={isDeletingItem}
              showRequests={showRequests}
              onRequestItem={onRequestItem}
            />
          </>
        )}
      </TabsContent>
    </div>
  );
};

export default FreebiesSections;
