import { useState } from "react";
import { GoodsItemFormData, GoodsRequestFormData, GoodsItemCategory } from "@/components/support/types/formTypes";

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
    availableDays: initialValues?.availableDays || 30,
    images: initialValues?.images || []
  });
  
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: initialValues?.urgency || "medium",
    // Use the initialValues category if available, otherwise use default
    category: (initialValues?.category as GoodsItemCategory) || defaultCategory
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
