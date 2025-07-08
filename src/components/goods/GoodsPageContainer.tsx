
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import GoodsSections from './GoodsSections';
import ItemRequestDialog from "@/components/items/dialogs/ItemRequestDialog";
import { Tabs } from "@/components/ui/tabs";

/**
 * GoodsPageContainer Component
 * 
 * This is the main container for the Goods Exchange page, structured similarly
 * to the Skills page for consistency across modules.
 * 
 * Updated to use side-panels instead of dialogs for adding items.
 */
interface GoodsPageContainerProps {
  onOfferItem: () => void;
  onRequestItem: () => void;
}

const GoodsPageContainer = ({ onOfferItem, onRequestItem }: GoodsPageContainerProps) => {
  // State management for filters and views
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("offers");
  
  // State for viewing selected items (still using dialog for viewing)
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Fetch goods data
  const { data: goodsData, isLoading, refetch } = useGoodsExchange();

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
          onOfferItem={onOfferItem}
          onRequestItem={onRequestItem}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </Tabs>

      {/* Dialog for viewing item details (unchanged) */}
      <ItemRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      />
    </div>
  );
};

export default GoodsPageContainer;
