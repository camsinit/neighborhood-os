
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import GoodsSections from './GoodsSections';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsDialogs from './GoodsDialogs';
import { Tabs } from "@/components/ui/tabs";

/**
 * GoodsPageContainer Component
 * 
 * This is the main container for the Goods Exchange page, structured similarly
 * to the Skills page for consistency across modules.
 */
const GoodsPageContainer = () => {
  // State management for filters and views
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("offers");
  
  // Dialog state management
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [initialRequestType, setInitialRequestType] = useState(null);
  
  // Fetch goods data
  const { data: goodsData, isLoading, refetch } = useGoodsExchange();

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

  return (
    <div className="space-y-6">
      {/* Main content area with simplified structure */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <GoodsSections 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          goodsData={goodsData}
          isLoading={isLoading}
          showUrgent={showUrgent}
          showRequests={showRequests}
          showAvailable={showAvailable}
          onRequestSelect={setSelectedRequest}
          onRefresh={refetch}
          onOfferItem={handleAddItem}
          onRequestItem={handleAddRequest}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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
