
/**
 * Custom hook for goods item deletion functionality
 * 
 * This hook encapsulates the logic for deleting goods items and
 * notifying the activity feed about the deletion.
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GoodsExchangeItem } from '@/types/localTypes';
import { useUser } from "@supabase/auth-helpers-react";

export const useGoodsItemDeletion = (onRefresh: () => void) => {
  // Get the current user for permission checks
  const currentUser = useUser();
  const queryClient = useQueryClient();
  
  // State to track if we're currently deleting an item
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  /**
   * Handle deleting a goods item
   * 
   * This function:
   * 1. Deletes the item from the database
   * 2. Calls the edge function to update the activity feed
   * 3. Refreshes the goods data
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

  return { handleDeleteGoodsItem, isDeletingItem };
};
