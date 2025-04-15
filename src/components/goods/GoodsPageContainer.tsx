import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import GoodsSections from './GoodsSections';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsSearchBar from './GoodsSearchBar';
import GoodsDialogs from './GoodsDialogs';
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { Tabs } from "@/components/ui/tabs";

/**
 * GoodsPageContainer Component
 * 
 * This is the main container for the Goods Exchange page that manages the overall state
 * and coordinates different sections of the goods exchange functionality.
 */
const GoodsPageContainer = () => {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // State for handling dialogs and item selection
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [initialRequestType, setInitialRequestType] = useState(null);
  
  // Fetch goods data from the backend
  const { data: goodsData, isLoading, refetch } = useGoodsExchange();

  // Handler for adding new items (offers)
  const handleAddItem = () => {
    setInitialRequestType('offer');
    setIsAddRequestOpen(true);
  };

  // Handler for adding new requests (needs)
  const handleAddRequest = () => {
    setInitialRequestType('need');
    setIsAddRequestOpen(true);
  };

  // Handler for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-full w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page header with title and action buttons */}
          <GoodsPageHeader />
          
          {/* Description box with glow effect */}
          <GlowingDescriptionBox colorClass="goods-color">
            <p className="text-gray-700 text-sm">
              Share resources with your neighbors through our community exchange. 
              Offer items you no longer need, or find things you're looking for.
            </p>
          </GlowingDescriptionBox>

          {/* Search bar with filters and main content */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            {/* Add the title here, above the Tabs component */}
            <h2 className="text-2xl font-bold mb-6">Available Items</h2>
            
            {/* Wrap everything in a Tabs component */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              {/* Search bar with filters */}
              <GoodsSearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRequestItem={handleAddRequest}
                onOfferItem={handleAddItem}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
              
              {/* Main content sections */}
              <GoodsSections 
                searchQuery={searchQuery}
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
              />
            </Tabs>
          </div>
          
          {/* Dialogs for adding/viewing items */}
          <GoodsDialogs 
            isAddRequestOpen={isAddRequestOpen}
            selectedRequest={selectedRequest}
            onAddRequestOpenChange={setIsAddRequestOpen}
            onSelectedRequestChange={setSelectedRequest}
            initialRequestType={initialRequestType}
          />
        </div>
      </div>
    </div>
  );
};

export default GoodsPageContainer;
