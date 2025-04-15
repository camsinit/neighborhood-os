
// This hook manages the form state
import { useState } from "react";
import { GoodsItemFormData, GoodsRequestFormData, GoodsItemCategory } from "@/components/support/types/formTypes";

export const useGoodsFormState = (initialValues: any, initialRequestType: "offer" | "request" | null) => {
  const isOfferForm = initialRequestType === "offer";
  
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    requestType: initialRequestType || "offer",
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
