import { useEffect, useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { useSupportRequests } from '@/utils/queries/useSupportRequests';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Button } from '@/components/ui/button';
import { Package, Filter } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import AddSupportRequestDialog from '@/components/AddSupportRequestDialog';
import UrgentRequestsSection from '@/components/goods/UrgentRequestsSection';
import GoodsRequestsSection from '@/components/goods/GoodsRequestsSection';
import AvailableItemsSection from '@/components/goods/AvailableItemsSection';
import SupportRequestDialog from '@/components/support/SupportRequestDialog';
import GoodsPageHeader from '@/components/goods/GoodsPageHeader';
import GoodsSearchBar from '@/components/goods/GoodsSearchBar';

/**
 * GoodsPage displays items that community members are sharing, offering, or requesting
 * 
 * This page is structured into several sections:
 * - Urgent requests (high priority needs)
 * - Available items (things being offered)
 * - General requests (non-urgent needs)
 * 
 * It also includes functionality for:
 * - Filtering and searching items
 * - Adding new items/requests
 * - Viewing detailed information about items
 */
const GoodsPage = () => {
  // State variables
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GoodsExchangeItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Fetch support requests data
  const { data: allRequests, isLoading, refetch } = useSupportRequests();
  
  // Setup auto-refresh with enhanced event names - this is critical for seeing new items
  useAutoRefresh(
    ['support-requests'],
    ['goods-request-submitted', 'goods-request-updated', 'goods-form-submitted'], 
    500
  );
  
  // Log when data is loaded to help with debugging
  useEffect(() => {
    if (allRequests) {
      console.log('Goods data loaded:', allRequests.length, 'items', 
        allRequests.filter(req => req.category === 'goods').length, 'goods items');
    }
  }, [allRequests]);
  
  // Filter goods exchange items
  const goodsItems = allRequests
    ?.filter(req => 
      req.category === 'goods' && 
      req.request_type === 'offer' &&
      !req.is_archived &&
      (searchTerm ? req.title.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (categoryFilter ? req.goods_category === categoryFilter : true)
    ) || [];
  
  // Filter goods requests
  const goodsRequests = allRequests
    ?.filter(req => 
      req.category === 'goods' && 
      req.request_type === 'need' &&
      !req.is_archived &&
      (searchTerm ? req.title.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (categoryFilter ? req.goods_category === categoryFilter : true)
    ) || [];
  
  // Filter urgent requests (high or critical urgency)
  const urgentRequests = goodsRequests.filter(req => 
    (req.urgency === 'high' || req.urgency === 'critical')
  );
  
  // Helper functions
  const getUrgencyClass = (urgency: string) => {
    switch(urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };
  
  const getUrgencyLabel = (urgency: string) => {
    switch(urgency) {
      case 'critical': return 'Critical';
      case 'high': return 'Urgent';
      case 'medium': return 'Soon';
      default: return 'Anytime';
    }
  };
  
  const handleAddItem = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddingItem(true);
  };
  
  const handleRequestSelect = (request: GoodsExchangeItem) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };
  
  // If loading, show a loading message
  if (isLoading) {
    return <div className="p-6">Loading goods exchange...</div>;
  }
  
  return (
    <div className="container py-6 max-w-6xl">
      <GoodsPageHeader 
        onAddOffer={() => handleAddItem("offer")}
        onAddRequest={() => handleAddItem("need")}
      />
      
      <GoodsSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />
      
      {/* Urgent Requests Section */}
      <UrgentRequestsSection 
        urgentRequests={urgentRequests}
        onRequestSelect={handleRequestSelect}
        getUrgencyClass={getUrgencyClass}
        getUrgencyLabel={getUrgencyLabel}
      />
      
      {/* Available Items Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Available Items</h2>
          <Button 
            variant="outline" 
            onClick={() => handleAddItem("offer")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Share an Item</span>
          </Button>
        </div>
        
        <AvailableItemsSection 
          goodsItems={goodsItems}
          onRequestSelect={handleRequestSelect}
          onNewOffer={() => handleAddItem("offer")}
          onRefetch={refetch}
        />
      </div>
      
      {/* Other Requests Section */}
      <GoodsRequestsSection 
        goodsRequests={goodsRequests}
        urgentRequests={urgentRequests}
        onRequestSelect={handleRequestSelect}
        getUrgencyClass={getUrgencyClass}
        getUrgencyLabel={getUrgencyLabel}
      />
      
      {/* Modals */}
      <AddSupportRequestDialog 
        open={isAddingItem}
        onOpenChange={setIsAddingItem}
        initialRequestType={initialRequestType}
        view='goods'
      />
      
      <SupportRequestDialog 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        requestId={selectedRequest?.id}
      />
    </div>
  );
};

export default GoodsPage;
