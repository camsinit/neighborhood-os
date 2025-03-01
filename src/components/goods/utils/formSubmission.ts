
// This utility file handles form data formatting and submission
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";
import { validateItemForm, validateRequestForm } from "./formValidation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Format the offer data for submission to the database
 * 
 * @param itemFormData The form data to format
 * @param userId The ID of the user submitting the form
 * @returns The formatted data ready for database insertion
 */
export const formatOfferData = (itemFormData: Partial<GoodsItemFormData>, userId: string) => {
  return {
    title: itemFormData.title,
    description: itemFormData.description,
    goods_category: itemFormData.category, // Match the column name in the database
    category: 'goods', // For compatibility with existing queries
    request_type: 'offer',
    user_id: userId,
    valid_until: new Date(Date.now() + (itemFormData.availableDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
    images: itemFormData.images, // Now matches the column name in database
    is_archived: false
  };
};

/**
 * Format the request data for submission to the database
 * 
 * @param requestFormData The form data to format
 * @param userId The ID of the user submitting the form
 * @returns The formatted data ready for database insertion
 */
export const formatRequestData = (requestFormData: Partial<GoodsRequestFormData>, userId: string) => {
  return {
    title: requestFormData.title,
    description: requestFormData.description,
    goods_category: requestFormData.category || null, // Match column name
    category: 'goods', // For compatibility with existing queries
    request_type: 'need',
    user_id: userId,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: requestFormData.image, // Keep for backward compatibility
    urgency: requestFormData.urgency, // Match column name
    is_archived: false
  };
};

/**
 * Submit an offer or request to the database
 * 
 * @param isOfferForm Whether this is an offer form (true) or request form (false)
 * @param itemFormData The form data for offers
 * @param requestFormData The form data for requests
 * @param userId The ID of the user submitting the form
 * @returns A promise that resolves when the submission is complete
 */
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string
) => {
  // Validate form data
  if (isOfferForm) {
    if (!validateItemForm(itemFormData)) {
      return false;
    }
    
    // Format data for submission
    const formattedData = formatOfferData(itemFormData, userId);
    
    console.log("Submitting offer data:", formattedData);
    
    // Submit data to the database
    const { error } = await supabase
      .from('goods_exchange')
      .insert(formattedData);
      
    if (error) {
      console.error('Error submitting goods form:', error);
      throw error;
    }
  } else {
    if (!validateRequestForm(requestFormData)) {
      return false;
    }
    
    // Format data for submission
    const formattedData = formatRequestData(requestFormData, userId);
    
    console.log("Submitting request data:", formattedData);
    
    // Submit data to the database
    const { error } = await supabase
      .from('goods_exchange')
      .insert(formattedData);
      
    if (error) {
      console.error('Error submitting goods form:', error);
      throw error;
    }
  }
  
  return true;
};
