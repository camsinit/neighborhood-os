
// This utility file handles form validation for the goods form
import { ItemFormData, RequestFormData } from "../types/goodsFormTypes";

// Validation result type for better error handling
export interface ValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    description?: string;
    category?: string;
    images?: string;
    urgency?: string;
  };
}

/**
 * Validates the item form data for offer submissions
 * Returns validation result with specific field errors instead of showing toasts
 * 
 * @param itemFormData The form data to validate
 * @returns ValidationResult with isValid flag and specific field errors
 */
export const validateItemForm = (itemFormData: Partial<ItemFormData>): ValidationResult => {
  const errors: ValidationResult['errors'] = {};
  
  // Check required fields
  if (!itemFormData.title?.trim()) {
    errors.title = "Item title is required";
  }
  
  if (!itemFormData.description?.trim()) {
    errors.description = "Item description is required";
  }
  
  if (!itemFormData.category) {
    errors.category = "Please select a category";
  }
  
  // Check if at least one image is uploaded
  if (!itemFormData.images?.length) {
    errors.images = "Please upload at least one image of the item";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates the request form data for need submissions
 * Returns validation result with specific field errors instead of showing toasts
 * 
 * @param requestFormData The form data to validate
 * @returns ValidationResult with isValid flag and specific field errors
 */
export const validateRequestForm = (requestFormData: Partial<RequestFormData>): ValidationResult => {
  const errors: ValidationResult['errors'] = {};
  
  // Check required fields
  if (!requestFormData.title?.trim()) {
    errors.title = "Request title is required";
  }
  
  if (!requestFormData.description?.trim()) {
    errors.description = "Request description is required";
  }
  
  if (!requestFormData.urgency) {
    errors.urgency = "Please select urgency level";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
