
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
    // Remove default category, leave it as undefined
    category: (initialValues as any)?.category,
    // Use the normalized request type that matches the expected type
    requestType: normalizedRequestType || "offer",
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    // Remove default category, leave it as undefined
    category: (initialValues as any)?.category
  });
  
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory | undefined>(
    // Remove default category, leave it as undefined
    (initialValues as any)?.category
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
