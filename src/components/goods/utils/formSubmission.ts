
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";
import { unifiedEvents } from "@/utils/unifiedEventSystem";

/**
 * Submits or updates a goods form (either offer or request)
 */
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string,
  neighborhoodId: string,
  itemId?: string
): Promise<boolean> => {
  try {
    const baseData = {
      title: isOfferForm ? itemFormData.title : requestFormData.title,
      description: isOfferForm ? itemFormData.description : requestFormData.description,
      category: 'goods',
      request_type: isOfferForm ? 'offer' : 'need',
      user_id: userId,
      neighborhood_id: neighborhoodId,
      is_archived: false,
      is_read: false
    };

    if (isOfferForm) {
      const offerData = {
        ...baseData,
        goods_category: itemFormData.category || 'furniture',
        images: itemFormData.images || [],
        image_url: itemFormData.images?.[0] || null,
        valid_until: new Date(Date.now() + (itemFormData.availableDays || 30) * 24 * 60 * 60 * 1000).toISOString()
      };

      let result;
      if (itemId) {
        const { data, error } = await supabase
          .from('goods_exchange')
          .update(offerData)
          .eq('id', itemId)
          .eq('user_id', userId)
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Item updated successfully!');
        
        unifiedEvents.emit('activities');
      } else {
        const { data, error } = await supabase
          .from('goods_exchange')
          .insert([offerData])
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Item offered successfully!');
        
        if (result && result[0]) {
          unifiedEvents.emitDatabaseChange('create', 'goods');
        }
      }

      console.log(itemId ? 'Updated goods offer:' : 'Created goods offer:', result);
    } else {
      const requestData = {
        ...baseData,
        urgency: requestFormData.urgency || 'medium',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      let result;
      if (itemId) {
        const { data, error } = await supabase
          .from('goods_exchange')
          .update(requestData)
          .eq('id', itemId)
          .eq('user_id', userId)
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Request updated successfully!');
        
        unifiedEvents.emit('activities');
      } else {
        const { data, error } = await supabase
          .from('goods_exchange')
          .insert([requestData])
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Request submitted successfully!');
        
        if (result && result[0]) {
          unifiedEvents.emitDatabaseChange('create', 'goods');
        }
      }

      console.log(itemId ? 'Updated goods request:' : 'Created goods request:', result);
    }

    return true;
  } catch (error) {
    console.error('Error submitting goods form:', error);
    toast.error(`Failed to ${itemId ? 'update' : 'submit'} ${isOfferForm ? 'offer' : 'request'}. Please try again.`);
    return false;
  }
};
