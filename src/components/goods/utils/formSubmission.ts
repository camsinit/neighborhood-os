
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ItemFormData, RequestFormData } from '@/components/support/types/formTypes';
import { uploadImage } from './imageUpload';

// Helper function to format the offer form data for submission
export const formatOfferSubmission = async (
  itemFormData: ItemFormData, 
  userId: string
) => {
  // Format the date to be 30 days from now (or whatever the user specified)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (itemFormData.availableDays || 30));

  // Create the data object for submission
  return {
    title: itemFormData.title,
    description: itemFormData.description,
    goods_category: itemFormData.category,
    category: 'goods', // Default category is 'goods'
    request_type: 'offer',
    user_id: userId,
    valid_until: validUntil.toISOString(),
    images: itemFormData.images,
    is_archived: false,
  };
};

// Helper function to format the request form data for submission
export const formatRequestSubmission = async (
  requestFormData: RequestFormData,
  userId: string
) => {
  // Format the date to be 30 days from now (default expiration)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  // Create the data object for submission
  return {
    title: requestFormData.title,
    description: requestFormData.description,
    category: 'goods', // Default category is 'goods'
    request_type: 'need',
    user_id: userId,
    valid_until: validUntil.toISOString(),
    image_url: requestFormData.image,
    urgency: requestFormData.urgency,
    is_archived: false,
  };
};

// Main function to submit the goods form data
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: ItemFormData,
  requestFormData: RequestFormData,
  userId: string
) => {
  try {
    // Show a loading toast to indicate form submission is in progress
    const loadingToast = toast.loading("Submitting your item...");
    
    // Format the data based on whether it's an offer or request
    const formattedData = isOfferForm
      ? await formatOfferSubmission(itemFormData, userId)
      : await formatRequestSubmission(requestFormData, userId);
    
    // Submit the data to the goods_exchange table
    const { data, error } = await supabase
      .from('goods_exchange')
      .insert(formattedData)
      .select();
    
    // Handle any errors that occur during submission
    if (error) {
      console.error("Error submitting goods form:", error);
      toast.error("There was a problem submitting your item.");
      throw error;
    }
    
    // Dismiss the loading toast and show a success message
    toast.dismiss(loadingToast);
    toast.success(`Your item was ${isOfferForm ? 'offered' : 'requested'} successfully!`);
    
    // Dispatch a custom event to signal that the form was submitted successfully
    // This will trigger a data refresh in the GoodsPage component
    const customEvent = new Event('goods-form-submitted');
    document.dispatchEvent(customEvent);
    
    return data;
  } catch (error) {
    console.error("Error submitting goods form:", error);
    toast.error("There was a problem submitting your item.");
    throw error;
  }
};
