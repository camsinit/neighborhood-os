import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import GoodsSections from './GoodsSections';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsSearchBar from './GoodsSearchBar';
import GoodsDialogs from './GoodsDialogs';
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { Tabs } from "@/components/ui/tabs";
import EmptyState from "@/components/ui/empty-state";
import { PackageSearch, Gift } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("offers");
  
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

  // Get the title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case "needs":
        return "Requested Items";
      case "offers":
        return "Available Items";
      default:
        return "Community Exchange";
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <GoodsPageHeader />
            
            <GlowingDescriptionBox colorClass="goods-color">
              <p className="text-gray-700 text-sm">
                Share resources with your neighbors through our community exchange. 
                Offer items you no longer need, or find things you're looking for.
              </p>
            </GlowingDescriptionBox>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
              
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <GoodsSearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onRequestItem={handleAddRequest}
                  onOfferItem={handleAddItem}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
                
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
    </div>
  );
};

export default GoodsPageContainer;
