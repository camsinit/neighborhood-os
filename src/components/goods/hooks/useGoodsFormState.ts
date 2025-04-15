
import { useState } from "react";
import { GoodsItemFormData, GoodsRequestFormData, GoodsItemCategory } from "@/components/support/types/formTypes";

export const useGoodsFormState = (initialValues: any, initialRequestType: "offer" | "request" | "need" | null) => {
  // Convert "request" to "need" to match the expected types in GoodsItemFormData
  const normalizedRequestType = initialRequestType === "request" ? "need" : initialRequestType;
  // Check if this is an offer form
  const isOfferForm = normalizedRequestType === "offer";
  
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    // No default category - making sure it's explicitly undefined
    category: (initialValues as any)?.category || undefined,
    // Use the normalized request type that matches the expected type
    requestType: normalizedRequestType || "offer",
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    // No default category - making sure it's explicitly undefined
    category: (initialValues as any)?.category || undefined
  });
  
  const [uploading, setUploading] = useState(false);
  
  // Explicitly set to undefined by default (not a string or any other value)
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory | undefined>(
    (initialValues as any)?.category || undefined
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
