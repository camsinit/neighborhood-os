
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoodsItemFormData, GoodsRequestFormData } from '@/components/support/types/formTypes';

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
  itemFormData: Partial<GoodsItemFormData>, 
  userId: string
) => {
  // Format the date to be 30 days from now (or whatever the user specified)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (itemFormData.availableDays || 30));
  
  // Debug log to verify what we're submitting
  console.log('Formatting offer submission:', {
    title: itemFormData.title,
    description: itemFormData.description,
    category: 'goods', 
    goods_category: itemFormData.category,
    request_type: 'offer',
    images: itemFormData.images,
  });

  // Create the data object for submission
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
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string
) => {
  // Format the date to be 30 days from now (default expiration)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  
  // Debug log to verify what we're submitting
  console.log('Formatting request submission:', {
    title: requestFormData.title,
    description: requestFormData.description,
    category: 'goods',
    request_type: 'need',
    urgency: requestFormData.urgency,
    image: requestFormData.image,
  });

  // Create the data object for submission
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
  };
};

/**
 * Notify the goods changes edge function about item creation, updates, or deletion
 *
 * @param goodsItemId - ID of the goods item
 * @param action - The action being performed (create, update, delete)
 * @param goodsItemTitle - Title of the goods item
 * @param userId - ID of the current user
 * @param requestType - Whether this is an offer or need
 * @param neighborhoodId - ID of the current neighborhood
 * @param category - Category of the goods item
 * @param urgency - Urgency of the request (if applicable)
 */
export const notifyGoodsChanges = async (
  goodsItemId: string,
  action: 'create' | 'update' | 'delete',
  goodsItemTitle: string,
  userId: string,
  requestType: 'offer' | 'need',
  neighborhoodId: string,
  category?: string,
  urgency?: string,
) => {
  try {
    // Call the edge function with goods_item_id instead of id
    const { error } = await supabase.functions.invoke(
      'notify-goods-changes',
      {
        body: {
          goodsItemId, // Using goods_item_id now
          action,
          goodsItemTitle,
          userId,
          requestType,
          neighborhoodId,
          category,
          urgency
        }
      }
    );

    if (error) {
      console.error("[notifyGoodsChanges] Error calling edge function:", error);
      // We don't throw here to avoid interrupting the main operation
    } else {
      console.log(`[notifyGoodsChanges] Successfully notified about ${action} action for goods item ID: ${goodsItemId}`);
    }
  } catch (error) {
    console.error("[notifyGoodsChanges] Exception in edge function call:", error);
    // Again, don't throw to avoid interrupting main flow
  }
};

/**
 * Main function to submit the goods form data
 * 
 * This function handles the entire submission process, including:
 * - Showing loading and success/error toasts
 * - Formatting the data
 * - Submitting to Supabase
 * - Notifying the edge function
 * - Triggering a refresh of the goods list
 * 
 * @param isOfferForm - Whether this is an offer (true) or request (false) submission
 * @param itemFormData - The data from the offer form (if applicable)
 * @param requestFormData - The data from the request form (if applicable)
 * @param userId - The ID of the current user
 * @param neighborhoodId - The ID of the current neighborhood
 * @param mode - Optional mode parameter (create, update, delete)
 * @param goodsItemId - Optional goods item ID for updates/deletes
 * @returns The data returned from the database operation
 */
export const submitGoodsForm = async (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string,
  neighborhoodId: string,
  mode: 'create' | 'update' | 'delete' = 'create',
  goodsItemId?: string
) => {
  // Initialize a variable to hold our toast ID
  let loadingToastId: string | number | undefined;
  
  try {
    // Create the loading toast and store its ID
    loadingToastId = toast.loading(
      mode === 'delete' 
        ? "Removing your item..." 
        : mode === 'update' 
          ? "Updating your item..." 
          : "Submitting your item..."
    );

    if (!neighborhoodId) {
      console.error("Missing neighborhood_id in submission");
      toast.error("There was a problem: Missing neighborhood information");
      // Dismiss the loading toast
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      return null;
    }
    
    let formattedData, data;
    
    if (mode === 'delete' && goodsItemId) {
      console.log(`Deleting goods item: ${goodsItemId}`);
      
      const { error, data: deletedData } = await supabase
        .from('goods_exchange')
        .delete()
        .eq('id', goodsItemId)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      data = deletedData;
      
    } else if (mode === 'update' && goodsItemId) {
      formattedData = isOfferForm
        ? await formatOfferSubmission(itemFormData, userId)
        : await formatRequestSubmission(requestFormData, userId);
      
      const { user_id, ...updateData } = formattedData;
      
      console.log("Updating goods exchange item:", goodsItemId, updateData);
      
      const { error, data: updatedData } = await supabase
        .from('goods_exchange')
        .update({ ...updateData, neighborhood_id: neighborhoodId })
        .eq('id', goodsItemId)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      data = updatedData;
      
      // When updating or deleting items, we want to access the redundant ID field
      if (data && data[0]) {
        console.log("Updated goods item with goods_item_id:", data[0].goods_item_id);
      }
      
    } else {
      formattedData = isOfferForm
        ? { ...await formatOfferSubmission(itemFormData, userId), neighborhood_id: neighborhoodId }
        : { ...await formatRequestSubmission(requestFormData, userId), neighborhood_id: neighborhoodId };
      
      console.log("Creating goods exchange item:", formattedData);
      
      const { error, data: insertedData } = await supabase
        .from('goods_exchange')
        .insert(formattedData)
        .select();
      
      if (error) throw error;
      data = insertedData;
      
      // For new items, we want to capture the new goods_item_id
      if (data && data[0]) {
        console.log("Created goods item with goods_item_id:", data[0].goods_item_id);
        
        // Use the goods_item_id for notifications/activities
        if (data[0].goods_item_id && data[0].title) {
          // Notify when a new item is created
          await notifyGoodsChanges(
            data[0].goods_item_id, // Use the redundant ID
            'create',
            data[0].title,
            userId,
            isOfferForm ? 'offer' : 'need',
            neighborhoodId,
            data[0].goods_category || data[0].category,
            data[0].urgency
          );
        }
      }
    }
    
    // Dismiss loading toast and show success
    if (loadingToastId !== undefined) {
      toast.dismiss(loadingToastId);
    }
    
    toast.success(
      mode === 'delete' 
        ? "Item removed successfully"
        : mode === 'update'
        ? "Item updated successfully"
        : isOfferForm 
          ? "Item offered successfully!" 
          : "Request submitted successfully!"
    );
    
    // Trigger a refresh of the goods data
    document.dispatchEvent(new Event('goods-form-submitted'));
    
    return data;
    
  } catch (error) {
    console.error("Error in goods form submission:", error);
    
    // Always dismiss the loading toast, even on error
    if (loadingToastId !== undefined) {
      toast.dismiss(loadingToastId);
    }
    
    toast.error("There was a problem with your request. Please try again.");
    throw error;
    
  } finally {
    // Extra safety: ensure loading toast is dismissed in all cases
    if (loadingToastId !== undefined) {
      toast.dismiss(loadingToastId);
    }
  }
};
