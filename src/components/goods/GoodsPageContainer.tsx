
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import GoodsSections from './GoodsSections';
import GoodsDialogs from './GoodsDialogs';
import { Tabs } from "@/components/ui/tabs";

/**
 * GoodsPageContainer Component Props
 */
interface GoodsPageContainerProps {
  // Dialog state is now controlled by the parent GoodsPage component
  isAddDialogOpen?: boolean;
  setIsAddDialogOpen?: (open: boolean) => void;
}

/**
 * GoodsPageContainer Component
 * 
 * This is the main container for the Goods Exchange page, structured similarly
 * to the Skills page for consistency across modules.
 */
const GoodsPageContainer = ({
  isAddDialogOpen = false,
  setIsAddDialogOpen = () => {}
}: GoodsPageContainerProps) => {
  // State management for filters and views
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("offers");
  
  // Local dialog state management
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [initialRequestType, setInitialRequestType] = useState(null);
  
  // Fetch goods data
  const { data: goodsData, isLoading, refetch } = useGoodsExchange();

  // Action handlers
  const handleAddItem = () => {
    setInitialRequestType('offer');
    setIsAddDialogOpen(true);
  };

  const handleAddRequest = () => {
    setInitialRequestType('need');
    setIsAddDialogOpen(true);
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
        isAddRequestOpen={isAddDialogOpen}
        selectedRequest={selectedRequest}
        onAddRequestOpenChange={setIsAddDialogOpen}
        onSelectedRequestChange={setSelectedRequest}
        initialRequestType={initialRequestType}
      />
    </div>
  );
};

export default GoodsPageContainer;
