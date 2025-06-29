
/**
 * Custom hook for goods item deletion functionality
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GoodsExchangeItem } from '@/types/localTypes';
import { useUser } from "@supabase/auth-helpers-react";
import { unifiedEvents } from '@/utils/unifiedEventSystem';

export const useGoodsItemDeletion = (onRefresh?: () => void, onItemDeleted?: () => void) => {
  const currentUser = useUser();
  const queryClient = useQueryClient();
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const handleDeleteGoodsItem = async (item: GoodsExchangeItem) => {
    try {
      setIsDeletingItem(true);

      const user = currentUser?.id;
      const neighborhoodId = item.neighborhood_id || '';

      if (!user) {
        toast.error("You must be logged in to delete items");
        setIsDeletingItem(false);
        return;
      }

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
      }

      toast.success("Item deleted successfully");
      
      queryClient.invalidateQueries({ queryKey: ["goods-exchange"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["goods-preview"] });
      
      unifiedEvents.emitMultiple(['goods', 'activities']);
      
      if (onRefresh) {
        onRefresh();
      }
      
      if (onItemDeleted) {
        onItemDeleted();
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("An error occurred while deleting the item");
    } finally {
      setIsDeletingItem(false);
    }
  };

  return { 
    handleDeleteGoodsItem, 
    isDeletingItem,
    handleDeleteItem: handleDeleteGoodsItem,
    isDeleting: isDeletingItem
  };
};
