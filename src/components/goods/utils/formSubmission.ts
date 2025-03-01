
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// Fix the incorrect type imports by using the correct types from formTypes.ts
import { GoodsItemFormData, GoodsRequestFormData } from '@/components/support/types/formTypes';
import { uploadImage } from './imageUpload';

/**
 * Helper function to format the offer form data for submission
 * 
 * This takes the form data from the offer form and formats it into the structure
 * expected by the Supabase database table.
 * 
 * @param itemFormData - The data entered in the offer form
 * @param userId - The ID of the current user
 * @returns A formatted object ready for database insertion
 */
export const formatOfferSubmission = async (
  itemFormData: GoodsItemFormData, 
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

/**
 * Helper function to format the request form data for submission
 * 
 * This takes the form data from the request form and formats it into the structure
 * expected by the Supabase database table.
 * 
 * @param requestFormData - The data entered in the request form
 * @param userId - The ID of the current user
 * @returns A formatted object ready for database insertion
 */
export const formatRequestSubmission = async (
  requestFormData: GoodsRequestFormData,
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

/**
 * Main function to submit the goods form data
 * 
 * This function handles the entire submission process, including:
 * - Showing loading and success/error toasts
 * - Formatting the data
 * - Submitting to Supabase
 * - Triggering a refresh of the goods list
 * 
 * @param isOfferForm - Whether this is an offer (true) or request (false) submission
 * @param itemFormData - The data from the offer form (if applicable)
 * @param requestFormData - The data from the request form (if applicable)
 * @param userId - The ID of the current user
 * @returns The data returned from the database insertion
 */
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: GoodsItemFormData,
  requestFormData: GoodsRequestFormData,
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
