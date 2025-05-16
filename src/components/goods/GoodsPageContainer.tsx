
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsDialogs from './GoodsDialogs';
import GoodsFilterBar from './GoodsFilterBar';
import GoodsListView from './views/GoodsListView';
import { GoodsItemCategory } from "@/components/support/types/formTypes";

/**
 * GoodsPageContainer Component
 * 
 * This is the main container for the Goods Exchange page, restructured to:
 * - Use a consistent tab system with filters
 * - Support proper highlighting for deep-linked items
 * - Organize layout similar to the Skills page
 */
const GoodsPageContainer = () => {
  // State management for filters and views
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory | null>(null);
  const [activeTab, setActiveTab] = useState("offers");
  
  // Dialog state management
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  
  // Get highlighted item details from the URL if any
  const highlightedItem = useHighlightedItem('goods');
  
  // Fetch goods data
  const { data: goodsData = [], isLoading, refetch } = useGoodsExchange();

  // Action handlers
  const handleAddItem = () => {
    setInitialRequestType('offer');
    setIsAddRequestOpen(true);
  };

  const handleAddRequest = () => {
    setInitialRequestType('need');
    setIsAddRequestOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCategoryChange = (category: GoodsItemCategory | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar with actions */}
      <GoodsFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onOfferItem={handleAddItem}
        onRequestItem={handleAddRequest}
      />
      
      {/* Tab content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-6 mt-0">
          <GoodsListView 
            goodsData={goodsData}
            isLoading={isLoading}
            searchQuery={searchQuery}
            requestType="offer"
            selectedCategory={selectedCategory}
            highlightedItemId={highlightedItem.id}
            onRefresh={refetch}
            onItemSelect={setSelectedRequest}
          />
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="needs" className="space-y-6 mt-0">
          <GoodsListView 
            goodsData={goodsData}
            isLoading={isLoading}
            searchQuery={searchQuery}
            requestType="need"
            selectedCategory={selectedCategory}
            highlightedItemId={highlightedItem.id}
            onRefresh={refetch}
            onItemSelect={setSelectedRequest}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GoodsDialogs 
        isAddRequestOpen={isAddRequestOpen}
        selectedRequest={selectedRequest}
        onAddRequestOpenChange={setIsAddRequestOpen}
        onSelectedRequestChange={setSelectedRequest}
        initialRequestType={initialRequestType}
      />
    </div>
  );
};

export default GoodsPageContainer;
