
import { useState } from "react";
import { ItemFormData, RequestFormData, GoodsCategory, UrgencyLevel, RequestType } from "../types/goodsFormTypes";

/**
 * Custom hook to manage the form state for goods items
 * 
 * This hook handles:
 * - Setting up the initial form state for both offers and requests
 * - Normalizing the request type between "offer", "need", and "request" formats
 * - Managing image upload state
 * - Tracking the selected category
 * 
 * @param initialValues - Optional initial values for the form
 * @param initialRequestType - Optional initial request type (offer or need)
 * @returns An object containing all the form state and utility functions
 */
export const useGoodsFormState = (initialValues?: Partial<ItemFormData | RequestFormData>, initialRequestType?: RequestType | null) => {
  // Set initial request type from initialRequestType prop, initialValues, or default to "offer"
  // First check if initialValues exists before trying to access its properties
  const requestTypeFromValues = initialValues?.requestType || initialRequestType || "offer";
  
  // Convert "request" to "need" to match the expected types in GoodsItemFormData
  // Note: We need to check against string literal "request" using a type assertion
  // This allows us to safely compare with a string that isn't in the RequestType union
  const normalizedRequestType: RequestType = (requestTypeFromValues as string) === "request" 
    ? "need" 
    : requestTypeFromValues as RequestType;
    
  // Check if this is an offer form
  const isOfferForm = normalizedRequestType === "offer";
  
  // Default category to 'Furniture' if none provided - this ensures we always have a category selected
  const defaultCategory: GoodsCategory = "Furniture";
  
  // For offer forms, we use the ItemFormData structure
  const [itemFormData, setItemFormData] = useState<Partial<ItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsCategory) || defaultCategory,
    // Set the requestType properly
    requestType: "offer",
    // Handle availableDays - only relevant for offer forms
    // First check if initialValues exists, then check if the property exists on initialValues
    availableDays: isOfferForm && initialValues && 'availableDays' in initialValues 
      ? (initialValues as Partial<ItemFormData>).availableDays || 30 
      : 30,
    // Handle images - only relevant for offer forms
    // First check if initialValues exists, then check if the property exists on initialValues
    images: isOfferForm && initialValues && 'images' in initialValues
      ? (initialValues as Partial<ItemFormData>).images || []
      : []
  });
  
  // For request forms, we use the RequestFormData structure
  const [requestFormData, setRequestFormData] = useState<Partial<RequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Handle urgency - only relevant for request forms
    // First check if initialValues exists, then check if the property exists on initialValues
    urgency: !isOfferForm && initialValues && 'urgency' in initialValues
      ? (initialValues as Partial<RequestFormData>).urgency || "medium"
      : "medium",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsCategory) || defaultCategory,
    // Set the requestType properly
    requestType: "need"
  });
  
  const [uploading, setUploading] = useState(false);
  
  // Set the selected category from initialValues or use default
  const [selectedCategory, setSelectedCategory] = useState<GoodsCategory>(
    (initialValues?.category as GoodsCategory) || defaultCategory
  );
  
  return {
    itemFormData,
    setItemFormData,
    requestFormData,
    setRequestFormData,
    uploading,
    setUploading,
    selectedCategory,
    setSelectedCategory,
    isOfferForm
  };
};
