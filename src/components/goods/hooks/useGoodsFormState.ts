
import { useState } from "react";
import { GoodsItemFormData, GoodsRequestFormData, GoodsItemCategory, RequestType } from "@/components/support/types/formTypes";

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
export const useGoodsFormState = (initialValues?: Partial<GoodsItemFormData | GoodsRequestFormData>, initialRequestType?: RequestType | null) => {
  // Set initial request type from initialRequestType prop, initialValues, or default to "offer"
  const requestTypeFromValues = initialValues?.requestType || initialRequestType || "offer";
  
  // Convert "request" to "need" to match the expected types in GoodsItemFormData
  // Note: We need to check against string literal "request" using a type assertion
  // This allows us to safely compare with a string that isn't in the RequestType union
  const normalizedRequestType: RequestType = (requestTypeFromValues as string) === "request" 
    ? "need" 
    : requestTypeFromValues as RequestType;
    
  // Check if this is an offer form
  const isOfferForm = normalizedRequestType === "offer";
  
  // Default category to 'furniture' if none provided - this ensures we always have a category selected
  const defaultCategory: GoodsItemCategory = "furniture";
  
  // For offer forms, we use the GoodsItemFormData structure
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsItemCategory) || defaultCategory,
    // Set the requestType properly
    requestType: "offer",
    // Handle availableDays - only relevant for offer forms
    availableDays: isOfferForm && 'availableDays' in initialValues 
      ? (initialValues as Partial<GoodsItemFormData>).availableDays || 30 
      : 30,
    // Handle images - only relevant for offer forms
    images: isOfferForm && 'images' in initialValues
      ? (initialValues as Partial<GoodsItemFormData>).images || []
      : []
  });
  
  // For request forms, we use the GoodsRequestFormData structure
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Handle urgency - only relevant for request forms
    urgency: !isOfferForm && 'urgency' in initialValues
      ? (initialValues as Partial<GoodsRequestFormData>).urgency || "medium"
      : "medium",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsItemCategory) || defaultCategory,
    // Set the requestType properly
    requestType: "need"
  });
  
  const [uploading, setUploading] = useState(false);
  
  // Set the selected category from initialValues or use default
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>(
    (initialValues?.category as GoodsItemCategory) || defaultCategory
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
