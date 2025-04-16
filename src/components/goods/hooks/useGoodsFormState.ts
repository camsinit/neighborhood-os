
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
  const normalizedRequestType = requestTypeFromValues === "request" ? "need" : requestTypeFromValues;
  // Check if this is an offer form
  const isOfferForm = normalizedRequestType === "offer";
  
  // Default category to 'furniture' if none provided - this ensures we always have a category selected
  const defaultCategory: GoodsItemCategory = "furniture";
  
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsItemCategory) || defaultCategory,
    // Use the normalized request type that matches the expected type
    requestType: normalizedRequestType || "offer",
    // Only set availableDays if this is an offer form or if it exists in initialValues
    availableDays: isOfferForm ? (initialValues?.availableDays as number) || 30 : undefined,
    // Only set images if this is an offer form or if it exists in initialValues
    images: isOfferForm ? (initialValues?.images as string[]) || [] : []
  });
  
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // Only set urgency if this is a request form or if it exists in initialValues
    urgency: !isOfferForm ? (initialValues?.urgency as any) || "medium" : undefined,
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsItemCategory) || defaultCategory,
    // Set the requestType for consistency
    requestType: normalizedRequestType as "need"
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
