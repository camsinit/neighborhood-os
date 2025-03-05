import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoodsItemFormData, GoodsRequestFormData } from '@/components/support/types/formTypes';
import { uploadImage } from './imageUpload';

export const getCurrentNeighborhoodId = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_current_neighborhood', {
      user_uuid: userId
    });
    
    if (error) {
      console.error("Error getting current neighborhood:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error getting current neighborhood:", error);
    return null;
  }
};

export const formatOfferSubmission = async (
  itemFormData: Partial<GoodsItemFormData>, 
  userId: string
) => {
  const neighborhoodId = await getCurrentNeighborhoodId(userId);
  
  if (!neighborhoodId) {
    throw new Error("Cannot create item: No neighborhood found for user");
  }
  
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (itemFormData.availableDays || 30));
  
  console.log('Formatting offer submission:', {
    title: itemFormData.title,
    description: itemFormData.description,
    category: 'goods', 
    goods_category: itemFormData.category,
    request_type: 'offer',
    images: itemFormData.images,
    neighborhood_id: neighborhoodId
  });

  return {
    title: itemFormData.title || "Untitled Item", // Provide a default title if not provided
    description: itemFormData.description || "", // Empty string as fallback
    goods_category: itemFormData.category || "other", // Default to 'other' if not specified
    category: 'goods', // Default category is 'goods'
    request_type: 'offer',
    user_id: userId,
    valid_until: validUntil.toISOString(),
    images: itemFormData.images || [], // Empty array as fallback for images
    is_archived: false,
    neighborhood_id: neighborhoodId
  };
};

export const formatRequestSubmission = async (
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string
) => {
  const neighborhoodId = await getCurrentNeighborhoodId(userId);
  
  if (!neighborhoodId) {
    throw new Error("Cannot create request: No neighborhood found for user");
  }
  
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  
  console.log('Formatting request submission:', {
    title: requestFormData.title,
    description: requestFormData.description,
    category: 'goods',
    request_type: 'need',
    urgency: requestFormData.urgency,
    image: requestFormData.image,
    neighborhood_id: neighborhoodId
  });

  return {
    title: requestFormData.title || "Untitled Request", // Provide default title
    description: requestFormData.description || "", // Empty string as fallback
    category: 'goods', // Default category is 'goods'
    request_type: 'need',
    user_id: userId,
    valid_until: validUntil.toISOString(),
    image_url: requestFormData.image || null, // Null as fallback
    urgency: requestFormData.urgency || "medium", // Default to medium urgency
    is_archived: false,
    neighborhood_id: neighborhoodId
  };
};

export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string
) => {
  try {
    const loadingToast = toast.loading("Submitting your item...");
    
    const formattedData = isOfferForm
      ? await formatOfferSubmission(itemFormData, userId)
      : await formatRequestSubmission(requestFormData, userId);
    
    console.log("Submitting to goods_exchange table:", formattedData);
    
    const { data, error } = await supabase
      .from('goods_exchange')
      .insert(formattedData)
      .select();
    
    if (error) {
      console.error("Error submitting goods form:", error);
      toast.error("There was a problem submitting your item.");
      throw error;
    }
    
    console.log("Successfully saved goods item:", data);
    
    toast.dismiss(loadingToast);
    toast.success(isOfferForm ? "Your item was offered successfully!" : "Your request was submitted successfully!");
    
    console.log("Dispatching goods-form-submitted event");
    const customEvent = new Event('goods-form-submitted');
    document.dispatchEvent(customEvent);
    
    return data;
  } catch (error) {
    console.error("Error submitting goods form:", error);
    toast.error("There was a problem submitting your item.");
    throw error;
  }
};
