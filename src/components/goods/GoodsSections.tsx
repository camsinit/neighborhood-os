
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createContactEmailLink } from './GoodsRequestsSection';
import UrgentRequestsSection from './UrgentRequestsSection';
import GoodsRequestsSection from './GoodsRequestsSection';
import AvailableItemsSection from './AvailableItemsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { Package2, ListFilter, ChevronDown, ChevronUp } from "lucide-react";

/**
 * GoodsSections component
 * 
 * This component organizes and displays the different sections of the goods exchange:
 * - Urgent Requests: High priority needs that require immediate attention
 * - Requests: Regular requests from neighbors looking for items
 * - Available: Items that neighbors are offering to share
 */
interface GoodsSectionsProps {
  goodsData: GoodsExchangeItem[];
  isLoading: boolean;
  searchQuery: string;
  showUrgent: boolean;
  showRequests: boolean;
  showAvailable: boolean;
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onRefresh: () => void;
  onOfferItem: () => void;
  onRequestItem: () => void;
}

const GoodsSections: React.FC<GoodsSectionsProps> = ({
  goodsData = [],
  isLoading,
  searchQuery,
  showUrgent,
  showRequests,
  showAvailable,
  onRequestSelect,
  onRefresh,
  onOfferItem,
  onRequestItem
}) => {
  // Get the current user for permission checks
  const currentUser = useUser();
  const queryClient = useQueryClient();

  // State to track if we're currently deleting an item
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  
  // State to track if the requests section is collapsed
  const [requestsCollapsed, setRequestsCollapsed] = useState(false);

  // Helper function to filter goods based on search query
  const filterBySearch = (goods: GoodsExchangeItem[]) => {
    if (!searchQuery) return goods;
    
    const query = searchQuery.toLowerCase();
    return goods.filter(item => 
      (item.title?.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query) ||
      item.goods_category?.toLowerCase().includes(query))
    );
  };
  
  /**
   * Helper function to categorize goods by urgency and type
   * Returns objects containing filtered arrays of goods items
   */
  const categorizeGoods = () => {
    // Filter by search first
    const filteredGoods = filterBySearch(goodsData || []);
    
    // Then categorize by type and urgency
    const urgentRequests = filteredGoods.filter(
      item => item.request_type === 'need' && item.urgency === 'high'
    );
    
    const requests = filteredGoods.filter(
      item => item.request_type === 'need' && item.urgency !== 'high'
    );
    
    const available = filteredGoods.filter(
      item => item.request_type === 'offer'
    );
    
    return { urgentRequests, requests, available };
  };

  /**
   * Function to get the appropriate CSS class for urgency labels
   */
  const getUrgencyClass = (urgency: string) => {
    switch(urgency?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Function to get a human-readable label for urgency levels
   */
  const getUrgencyLabel = (urgency: string) => {
    switch(urgency?.toLowerCase()) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Standard';
    }
  };

  /**
   * Function to delete a goods item
   * This will remove it from the database and notify the activity feed via our edge function
   */
  const handleDeleteGoodsItem = async (item: GoodsExchangeItem) => {
    try {
      // Set deleting state to prevent multiple clicks
      setIsDeletingItem(true);

      // Get the current user and neighborhood for the edge function
      const user = currentUser?.id;
      const neighborhoodId = item.neighborhood_id || '';

      if (!user) {
        toast.error("You must be logged in to delete items");
        setIsDeletingItem(false);
        return;
      }

      // First, delete from the database
      const { error } = await supabase
        .from('goods_exchange')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error("Error deleting goods item:", error);
        toast.error("Failed to delete item");
        setIsDeletingItem(false);
        return;
      }

      // Now call our edge function to update activity feed
      const { error: edgeFunctionError } = await supabase.functions.invoke(
        'notify-goods-changes', {
        body: {
          goodsItemId: item.id,
          action: 'delete',
          goodsItemTitle: item.title,
          userId: user,
          requestType: item.request_type,
          neighborhoodId: neighborhoodId
        }
      });

      if (edgeFunctionError) {
        console.error("Error calling edge function:", edgeFunctionError);
        // Don't show an error to the user since the item was already deleted
      }

      // Success! Refresh the data
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["goods-exchange"] });
      onRefresh();
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("An error occurred while deleting the item");
    } finally {
      setIsDeletingItem(false);
    }
  };
  
  // Get categorized goods
  const { urgentRequests, requests, available } = categorizeGoods();
  
  // Determine if we should show the requests section
  // Only show it if there are actual requests from neighbors
  const hasRequests = requests.length > 0 || urgentRequests.length > 0;
  
  // If loading, display a loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-pulse bg-gray-200 rounded-md h-8 w-32 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 h-64">
              <div className="animate-pulse bg-gray-200 h-32 w-full rounded-md mb-4"></div>
              <div className="animate-pulse bg-gray-200 h-6 w-3/4 rounded-md mb-3"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Main content with tabs for different sections
  return (
    <div className="mt-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>All Items</span>
          </TabsTrigger>
          <TabsTrigger value="needs" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>Available</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab content for all items */}
        <TabsContent value="all" className="space-y-8">
          {/* Conditionally render requests section only if there are requests */}
          {hasRequests && showRequests && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Requests from Neighbors
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setRequestsCollapsed(!requestsCollapsed)}
                    className="ml-2"
                  >
                    {requestsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </h2>
                <Button variant="outline" onClick={onRequestItem}>
                  Request an Item
                </Button>
              </div>
              
              {/* Show urgent and regular requests when not collapsed */}
              {!requestsCollapsed && (
                <>
                  {showUrgent && urgentRequests.length > 0 && (
                    <UrgentRequestsSection 
                      urgentRequests={urgentRequests} 
                      onRequestSelect={onRequestSelect}
                      getUrgencyClass={getUrgencyClass}
                      getUrgencyLabel={getUrgencyLabel}
                    />
                  )}
                  
                  <GoodsRequestsSection 
                    goodsRequests={requests}
                    urgentRequests={urgentRequests}
                    onRequestSelect={onRequestSelect}
                    getUrgencyClass={getUrgencyClass}
                    getUrgencyLabel={getUrgencyLabel}
                    onDeleteItem={handleDeleteGoodsItem}
                    isDeletingItem={isDeletingItem}
                  />
                </>
              )}
            </div>
          )}
          
          {showAvailable && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Available Items</h2>
                <Button variant="outline" onClick={onOfferItem}>
                  Offer an Item
                </Button>
              </div>
              
              <AvailableItemsSection 
                goodsItems={available}
                onRequestSelect={onRequestSelect}
                onNewOffer={onOfferItem}
                onRefetch={onRefresh}
                onDeleteItem={handleDeleteGoodsItem}
                isDeletingItem={isDeletingItem}
              />
            </div>
          )}
        </TabsContent>
        
        {/* Tab content for requests */}
        <TabsContent value="needs">
          <div className="space-y-8">
            {hasRequests ? (
              <>
                {showUrgent && urgentRequests.length > 0 && (
                  <UrgentRequestsSection 
                    urgentRequests={urgentRequests}
                    onRequestSelect={onRequestSelect}
                    getUrgencyClass={getUrgencyClass}
                    getUrgencyLabel={getUrgencyLabel}
                  />
                )}
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Requests from Neighbors</h2>
                    <Button variant="outline" onClick={onRequestItem}>
                      Request an Item
                    </Button>
                  </div>
                  
                  <GoodsRequestsSection 
                    goodsRequests={requests}
                    urgentRequests={urgentRequests}
                    onRequestSelect={onRequestSelect}
                    getUrgencyClass={getUrgencyClass}
                    getUrgencyLabel={getUrgencyLabel}
                    onDeleteItem={handleDeleteGoodsItem}
                    isDeletingItem={isDeletingItem}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No requests from neighbors yet</p>
                <Button onClick={onRequestItem}>
                  Be the First to Request an Item
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Tab content for offers */}
        <TabsContent value="offers">
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Available Items</h2>
              <Button variant="outline" onClick={onOfferItem}>
                Offer an Item
              </Button>
            </div>
            
            <AvailableItemsSection 
              goodsItems={available}
              onRequestSelect={onRequestSelect}
              onNewOffer={onOfferItem}
              onRefetch={onRefresh}
              onDeleteItem={handleDeleteGoodsItem}
              isDeletingItem={isDeletingItem}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoodsSections;
