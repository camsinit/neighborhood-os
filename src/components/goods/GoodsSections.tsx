import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { filterBySearch, getUrgencyClass, getUrgencyLabel } from './utils/sectionHelpers';
import { useGoodsItemDeletion } from './hooks/useGoodsItemDeletion';
import UrgentRequestsSection from './UrgentRequestsSection';
import GoodsRequestsSection from './GoodsRequestsSection';
import AvailableItemsSection from './AvailableItemsSection';
import { GoodsSectionsLoadingState, EmptyRequestsState } from './states/EmptyAndLoadingStates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package2, ListFilter, ChevronDown, ChevronUp } from "lucide-react";

/**
 * GoodsSections component
 * 
 * This component organizes and displays the different sections of the goods exchange:
 * - Urgent Requests: High priority needs that require immediate attention
 * - Requests: Regular requests from neighbors looking for items
 * - Available: Items that neighbors are offering to share
 */
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
}

/**
 * Helper function to categorize goods by urgency and type
 * Returns objects containing filtered arrays of goods items
 */
const categorizeGoods = (goodsData: GoodsExchangeItem[], searchQuery: string) => {
  // Filter by search first
  const filteredGoods = filterBySearch(goodsData || [], searchQuery);

  // Then categorize by type and urgency
  const urgentRequests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency === 'high');
  const requests = filteredGoods.filter(item => item.request_type === 'need' && item.urgency !== 'high');
  const available = filteredGoods.filter(item => item.request_type === 'offer');
  return {
    urgentRequests,
    requests,
    available
  };
};
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
  onRequestItem
}) => {
  // State to track if the requests section is collapsed
  const [requestsCollapsed, setRequestsCollapsed] = useState(false);

  // Use our custom hook for goods deletion
  const {
    handleDeleteGoodsItem,
    isDeletingItem
  } = useGoodsItemDeletion(onRefresh);

  // Get categorized goods
  const {
    urgentRequests,
    requests,
    available
  } = categorizeGoods(goodsData, searchQuery);

  // Determine if we should show the requests section
  // Only show it if there are actual requests from neighbors
  const hasRequests = requests.length > 0 || urgentRequests.length > 0;

  // If loading, display a loading state
  if (isLoading) {
    return <GoodsSectionsLoadingState />;
  }

  // Main content with tabs for different sections
  return (
    <div className="flex items-center gap-4">
      {/* Move this div up to be next to search bar */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>All Items</span>
          </TabsTrigger>
          <TabsTrigger value="needs" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>Available</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab content sections */}
        <TabsContent value="all" className="space-y-8">
          {/* Conditionally render requests section only if there are requests */}
          {hasRequests && showRequests && <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Requests from Neighbors
                  <Button variant="ghost" size="sm" onClick={() => setRequestsCollapsed(!requestsCollapsed)} className="ml-2">
                    {requestsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </h2>
                <Button variant="outline" onClick={onRequestItem}>
                  Request an Item
                </Button>
              </div>
              
              {/* Show urgent and regular requests when not collapsed */}
              {!requestsCollapsed && <>
                  {showUrgent && urgentRequests.length > 0 && <UrgentRequestsSection urgentRequests={urgentRequests} onRequestSelect={onRequestSelect} getUrgencyClass={getUrgencyClass} getUrgencyLabel={getUrgencyLabel} />}
                  
                  <GoodsRequestsSection goodsRequests={requests} urgentRequests={urgentRequests} onRequestSelect={onRequestSelect} getUrgencyClass={getUrgencyClass} getUrgencyLabel={getUrgencyLabel} onDeleteItem={handleDeleteGoodsItem} isDeletingItem={isDeletingItem} />
                </>}
            </div>}
          
          {showAvailable && <div className="mt-10">
              
              
              <AvailableItemsSection goodsItems={available} onRequestSelect={onRequestSelect} onNewOffer={onOfferItem} onRefetch={onRefresh} onDeleteItem={handleDeleteGoodsItem} isDeletingItem={isDeletingItem} />
            </div>}
        </TabsContent>
        
        {/* Tab content for requests */}
        <TabsContent value="needs">
          <div className="space-y-8">
            {hasRequests ? <>
                {showUrgent && urgentRequests.length > 0 && <UrgentRequestsSection urgentRequests={urgentRequests} onRequestSelect={onRequestSelect} getUrgencyClass={getUrgencyClass} getUrgencyLabel={getUrgencyLabel} />}
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Requests from Neighbors</h2>
                    <Button variant="outline" onClick={onRequestItem}>
                      Request an Item
                    </Button>
                  </div>
                  
                  <GoodsRequestsSection goodsRequests={requests} urgentRequests={urgentRequests} onRequestSelect={onRequestSelect} getUrgencyClass={getUrgencyClass} getUrgencyLabel={getUrgencyLabel} onDeleteItem={handleDeleteGoodsItem} isDeletingItem={isDeletingItem} />
                </div>
              </> : <EmptyRequestsState onRequestItem={onRequestItem} />}
          </div>
        </TabsContent>
        
        {/* Tab content for offers */}
        <TabsContent value="offers">
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Available Items</h2>
              <Button variant="outline" onClick={onOfferItem}>
                Offer an Item
              </Button>
            </div>
            
            <AvailableItemsSection goodsItems={available} onRequestSelect={onRequestSelect} onNewOffer={onOfferItem} onRefetch={onRefresh} onDeleteItem={handleDeleteGoodsItem} isDeletingItem={isDeletingItem} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoodsSections;
