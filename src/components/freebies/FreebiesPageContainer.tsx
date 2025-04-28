
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange'; // We'll keep the query name for now
import FreebiesSections from './FreebiesSections';
import FreebiesPageHeader from './FreebiesPageHeader';
import FreebiesDialogs from './FreebiesDialogs';
import { Tabs } from "@/components/ui/tabs";
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';

/**
 * FreebiesPageWrapper Component
 * 
 * This is a wrapper that ensures the QueryClient is available
 * If there's no QueryClient in context, it won't render the component
 * This prevents the "No QueryClient set" error
 */
const FreebiesPageContainer = () => {
  // Try to get the QueryClient from the parent context
  const queryClient = useQueryClient();
  
  // If there's no QueryClient, return null to prevent errors
  if (!queryClient) {
    console.error("QueryClient not found in context. Make sure QueryClientProvider is set up correctly.");
    // Return a simple message instead of null to make debugging easier
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Loading Freebies...</h2>
        <p className="text-gray-500">If this message persists, please refresh the page.</p>
      </div>
    );
  }

  // If QueryClient exists, render the actual component
  return <FreebiesContent />;
};

/**
 * FreebiesContent Component
 * 
 * This is the main container for the Freebies Exchange page, structured similarly
 * to the Skills page for consistency across modules.
 */
const FreebiesContent = () => {
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
  // Use try-catch to handle any React Query errors gracefully
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
