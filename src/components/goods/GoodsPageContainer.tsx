
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
// Fixed import statement to use default import
import GoodsSections from './GoodsSections';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsSearchBar from './GoodsSearchBar';
// Fixed import statement to use default import
import GoodsDialogs from './GoodsDialogs';
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";

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
            {/* Search bar with filters */}
            <GoodsSearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRequestItem={handleAddRequest}
              onOfferItem={handleAddItem}
              // onCategoryFilter prop is optional so we don't need to pass it
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
            />
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
