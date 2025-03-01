
import { useState, useEffect } from 'react';
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';
import { GoodsExchangeItem } from '@/types/localTypes';

// Import our newly created components
import GoodsPageHeader from "@/components/goods/GoodsPageHeader";
import GoodsSearchBar from "@/components/goods/GoodsSearchBar";
import UrgentRequestsSection from "@/components/goods/UrgentRequestsSection";
import AvailableItemsSection from "@/components/goods/AvailableItemsSection";
import GoodsRequestsSection from "@/components/goods/GoodsRequestsSection";

// Import urgency helper functions
import { getUrgencyClass, getUrgencyLabel } from "@/components/goods/utils/urgencyHelpers";
import { toast } from "sonner";

/**
 * GoodsPage component
 * 
 * This page allows users to browse, offer, and request items in the community.
 * It's organized into sections for urgent requests, available items, and other requests.
 */
const GoodsPage = () => {
  // Define our state variables
  // These variables control the dialog visibility and search functionality
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GoodsExchangeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);

  // Fetch support requests data from the database
  const { 
    data: requests, 
    isLoading,
    refetch
  } = useSupportRequests();

  // Automatically fetch fresh data when the component mounts or dialog closes
  // This ensures new items appear in the list immediately after submission
  useEffect(() => {
    // Refetch data when component mounts
    refetch();
    
    // Set up a listener for the dialog closing
    const onDialogClose = () => {
      // Short delay to ensure the database has time to update
      setTimeout(() => {
        console.log("Refreshing goods data after dialog close");
        refetch();
      }, 500);
    };

    // Add event listener to detect dialog close
    document.addEventListener('goods-form-submitted', onDialogClose);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('goods-form-submitted', onDialogClose);
    };
  }, [refetch]);

  // Debug the requests coming from the database
  useEffect(() => {
    if (requests) {
      console.log("Goods data loaded:", requests.length, "items", 
        requests.filter(req => req.category === 'goods').length, "goods items");
    }
  }, [requests]);

  // Filter goods items (offers)
  // This creates a list of items that people are offering to others
  const goodsItems = requests?.filter(req => 
    req.category === 'goods' && 
    !req.is_archived &&
    req.request_type === 'offer' &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) as GoodsExchangeItem[] || [];

  // Filter goods requests (needs)
  // This creates a list of items that people are requesting from others
  const goodsRequests = requests?.filter(req => 
    req.category === 'goods' && 
    !req.is_archived &&
    req.request_type === 'need' &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) as GoodsExchangeItem[] || [];

  // Filter for urgent requests
  // This creates a list of high-priority needs that should be displayed prominently
  const urgentRequests = goodsRequests.filter(req => {
    // Using as GoodsExchangeItem since we know these are goods items
    return req.urgency === 'high' || req.urgency === 'critical';
  }) as GoodsExchangeItem[];

  // Handler functions
  
  // Open the dialog to request an item
  const handleRequestItem = () => {
    setInitialRequestType("need");
    setIsAddRequestOpen(true);
  };
  
  // Open the dialog to offer an item
  const handleOfferItem = () => {
    setInitialRequestType("offer");
    setIsAddRequestOpen(true);
  };

  // Handler for when the dialog closes after submission
  const handleDialogChange = (open: boolean) => {
    setIsAddRequestOpen(open);
    if (!open) {
      // Refresh data after dialog closes
      setTimeout(() => {
        refetch();
      }, 500);
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FEC6A1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page title and introduction */}
          <GoodsPageHeader />
          
          {/* Urgent requests section - Shows high-priority needs */}
          <UrgentRequestsSection 
            urgentRequests={urgentRequests}
            onRequestSelect={setSelectedRequest}
            getUrgencyClass={getUrgencyClass}
            getUrgencyLabel={getUrgencyLabel}
          />

          {/* Main content section - Contains search, action buttons, and items */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            {/* Search bar and action buttons */}
            <GoodsSearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRequestItem={handleRequestItem}
              onOfferItem={handleOfferItem}
            />

            {/* Available items section - Shows offers from neighbors */}
            <AvailableItemsSection 
              goodsItems={goodsItems}
              onRequestSelect={setSelectedRequest}
              onNewOffer={handleOfferItem}
              onRefetch={refetch}
            />
            
            {/* Non-urgent requests section - Shows regular needs */}
            <GoodsRequestsSection 
              goodsRequests={goodsRequests}
              urgentRequests={urgentRequests}
              onRequestSelect={setSelectedRequest}
              getUrgencyClass={getUrgencyClass}
              getUrgencyLabel={getUrgencyLabel}
            />
          </div>
        </div>
      </div>

      {/* Dialog components for adding and viewing goods */}
      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={handleDialogChange}
        initialRequestType={initialRequestType}
        view="goods"
      />

      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={open => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default GoodsPage;
