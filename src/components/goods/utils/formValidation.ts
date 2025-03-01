
// This utility file handles form validation for the goods form
import { toast } from "sonner";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";

/**
 * Validates the item form data for offer submissions
 * 
 * @param itemFormData The form data to validate
 * @returns True if the form data is valid, false otherwise
 */
export const validateItemForm = (itemFormData: Partial<GoodsItemFormData>): boolean => {
  // Check if required fields are present
  if (!itemFormData.title || !itemFormData.description || !itemFormData.category) {
    toast.error("Please fill in all required fields");
    return false;
  }
  
  // Check if at least one image is uploaded
  if (!itemFormData.images?.length) {
    toast.error("Please upload at least one image of the item");
    return false;
  }
  
  return true;
};

/**
 * Validates the request form data for need submissions
 * 
 * @param requestFormData The form data to validate
 * @returns True if the form data is valid, false otherwise
 */
export const validateRequestForm = (requestFormData: Partial<GoodsRequestFormData>): boolean => {
  // Check if required fields are present
  if (!requestFormData.title || !requestFormData.description || !requestFormData.urgency) {
    toast.error("Please fill in all required fields");
    return false;
  }
  
  return true;
};
