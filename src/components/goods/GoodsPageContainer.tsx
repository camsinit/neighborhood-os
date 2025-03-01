
import { useState, useEffect } from 'react';
import { useGoodsExchange } from "@/utils/queries/useGoodsExchange";
import { GoodsExchangeItem } from '@/types/localTypes';
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/integrations/supabase/client";

// Import Components
import GoodsPageHeader from "./GoodsPageHeader";
import GoodsSearchBar from "./GoodsSearchBar";
import GoodsSections from "./GoodsSections";
import GoodsDialogs from "./GoodsDialogs";

/**
 * Main container component for the Goods page
 * 
 * This component handles:
 * - State management for the entire Goods page
 * - Data fetching through the useGoodsExchange hook
 * - Filtering of goods items based on search query
 * - Dialog management for adding/viewing goods items
 */
const GoodsPageContainer = () => {
  // Define our state variables
  // These variables control the dialog visibility and search functionality
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GoodsExchangeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [directDbData, setDirectDbData] = useState<any[]>([]);

  // Fetch goods data from the database using our dedicated hook
  const { 
    data: goodsExchangeItems, 
    isLoading,
    refetch
  } = useGoodsExchange();

  // Set up auto-refresh for goods data
  // This will listen for the goods-form-submitted event and refresh the data
  useAutoRefresh(['goods-exchange'], ['goods-form-submitted']);

  // Debug the goods data coming from the database
  useEffect(() => {
    if (goodsExchangeItems) {
      console.log("Goods data loaded:", goodsExchangeItems.length, "items");
      
      // More detailed logging to debug what's in the data
      const goodsItems = goodsExchangeItems.filter(item => 
        !item.is_archived &&
        item.request_type === 'offer'
      );
      
      console.log("Goods offers:", goodsItems.length, "items", goodsItems);
      
      const goodsRequests = goodsExchangeItems.filter(item => 
        !item.is_archived &&
        item.request_type === 'need'
      );
      
      console.log("Goods requests:", goodsRequests.length, "items", goodsRequests);
    }
  }, [goodsExchangeItems]);

  // For debugging - directly query the database to see what's in it
  useEffect(() => {
    const debugGoods = async () => {
      // Query goods_exchange directly to see what's there
      const { data, error } = await supabase
        .from('goods_exchange')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error querying goods_exchange:", error);
      } else {
        console.log("Direct goods_exchange query result:", data);
        setDirectDbData(data || []);
      }
    };
    
    debugGoods();
  }, [goodsExchangeItems]);  // Re-run when goods data changes to keep in sync

  // Filter goods items (offers)
  // This creates a list of items that people are offering to others
  const goodsItems = goodsExchangeItems?.filter(item => 
    !item.is_archived &&
    item.request_type === 'offer' &&
    (searchQuery === "" || 
     item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) as GoodsExchangeItem[] || [];

  // Filter goods requests (needs)
  // This creates a list of items that people are requesting from others
  const goodsRequests = goodsExchangeItems?.filter(item => 
    !item.is_archived &&
    item.request_type === 'need' &&
    (searchQuery === "" || 
     item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) as GoodsExchangeItem[] || [];

  // Filter for urgent requests
  // This creates a list of high-priority needs that should be displayed prominently
  const urgentRequests = goodsRequests.filter(req => {
    return req.urgency === 'high' || req.urgency === 'critical';
  }) as GoodsExchangeItem[];

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log("Manual refresh requested");
    refetch();
  };

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
    if (!open) {
      // When dialog closes, refresh the data after a short delay
      setTimeout(() => {
        console.log("Dialog closed, refreshing data");
        refetch();
      }, 500);
    }
    setIsAddRequestOpen(open);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FEC6A1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page title and introduction */}
          <GoodsPageHeader />
          
          {/* Main content - Contains all goods sections */}
          <GoodsSections 
            urgentRequests={urgentRequests}
            goodsRequests={goodsRequests}
            goodsItems={goodsItems}
            onRequestSelect={setSelectedRequest}
            onOfferItem={handleOfferItem}
            onRequestItem={handleRequestItem}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleManualRefresh}
          />
        </div>
      </div>

      {/* Dialogs for adding and viewing goods */}
      <GoodsDialogs 
        isAddRequestOpen={isAddRequestOpen}
        selectedRequest={selectedRequest}
        onAddRequestOpenChange={handleDialogChange}
        onSelectedRequestChange={(open) => !open && setSelectedRequest(null)}
        initialRequestType={initialRequestType}
      />
    </div>
  );
};

export default GoodsPageContainer;
