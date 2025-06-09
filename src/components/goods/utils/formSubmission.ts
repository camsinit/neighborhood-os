
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";

/**
 * Submits or updates a goods form (either offer or request)
 * 
 * This function handles both creating new goods items and updating existing ones
 * based on whether an itemId is provided.
 */
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string,
  neighborhoodId: string,
  itemId?: string // Optional ID for updating existing items
): Promise<boolean> => {
  try {
    // Prepare the data object that will be sent to the database
    const baseData = {
      title: isOfferForm ? itemFormData.title : requestFormData.title,
      description: isOfferForm ? itemFormData.description : requestFormData.description,
      category: 'goods', // Always 'goods' for goods exchange items
      request_type: isOfferForm ? 'offer' : 'need',
      user_id: userId,
      neighborhood_id: neighborhoodId,
      is_archived: false,
      is_read: false
    };

    // Add offer-specific fields
    if (isOfferForm) {
      const offerData = {
        ...baseData,
        goods_category: itemFormData.category || 'furniture',
        images: itemFormData.images || [],
        image_url: itemFormData.images?.[0] || null,
        // Calculate valid_until date based on availableDays
        valid_until: new Date(Date.now() + (itemFormData.availableDays || 30) * 24 * 60 * 60 * 1000).toISOString()
      };

      let result;
      if (itemId) {
        // Update existing item
        const { data, error } = await supabase
          .from('goods_exchange')
          .update(offerData)
          .eq('id', itemId)
          .eq('user_id', userId) // Ensure user can only update their own items
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Item updated successfully!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('goods_exchange')
          .insert([offerData])
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Item offered successfully!');
      }

      console.log(itemId ? 'Updated goods offer:' : 'Created goods offer:', result);
    } else {
      // Handle request-specific fields
      const requestData = {
        ...baseData,
        urgency: requestFormData.urgency || 'medium',
        // Set valid_until to 30 days from now for requests
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      let result;
      if (itemId) {
        // Update existing request
        const { data, error } = await supabase
          .from('goods_exchange')
          .update(requestData)
          .eq('id', itemId)
          .eq('user_id', userId) // Ensure user can only update their own items
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Request updated successfully!');
      } else {
        // Create new request
        const { data, error } = await supabase
          .from('goods_exchange')
          .insert([requestData])
          .select();
        
        if (error) throw error;
        result = data;
        toast.success('Request submitted successfully!');
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
