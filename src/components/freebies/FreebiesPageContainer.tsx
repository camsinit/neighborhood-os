
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange'; // We'll keep the query name for now
import FreebiesSections from './FreebiesSections';
import FreebiesPageHeader from './FreebiesPageHeader';
import FreebiesDialogs from './FreebiesDialogs';
import { Tabs } from "@/components/ui/tabs";

/**
 * FreebiesPageContainer Component
 * 
 * This is the main container for the Freebies Exchange page, structured similarly
 * to the Skills page for consistency across modules.
 */
const FreebiesPageContainer = () => {
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
  
  // Fetch freebies data (still using the goods_exchange table)
  const { data: freebiesData, isLoading, refetch } = useGoodsExchange();

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
        <FreebiesSections 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          freebiesData={freebiesData}
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
      <FreebiesDialogs 
        isAddRequestOpen={isAddRequestOpen}
        selectedRequest={selectedRequest}
        onAddRequestOpenChange={setIsAddRequestOpen}
        onSelectedRequestChange={setSelectedRequest}
        initialRequestType={initialRequestType}
      />
    </div>
  );
};

export default FreebiesPageContainer;
