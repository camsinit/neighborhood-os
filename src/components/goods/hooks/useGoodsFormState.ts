
// This hook manages the form state
import { useState } from "react";
import { GoodsItemFormData, GoodsRequestFormData, GoodsItemCategory } from "@/components/support/types/formTypes";

// Changed the type to accept both "request" and "need" to match what's used in different parts of the app
export const useGoodsFormState = (initialValues: any, initialRequestType: "offer" | "request" | "need" | null) => {
  // Convert "request" to "need" to match the expected types in GoodsItemFormData
  const normalizedRequestType = initialRequestType === "request" ? "need" : initialRequestType;
  // Check if this is an offer form
  const isOfferForm = normalizedRequestType === "offer";
  
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    // Use the normalized request type that matches the expected type
    requestType: normalizedRequestType || "offer",
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    category: (initialValues as any)?.category || "furniture"
  });
  
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>(
    (initialValues as any)?.category || "furniture"
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
