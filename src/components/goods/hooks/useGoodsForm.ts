
// This hook manages the state and handlers for the goods form
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  GoodsItemFormData, 
  GoodsRequestFormData, 
  GoodsItemCategory,
  GoodsFormProps
} from "@/components/support/types/formTypes";
import { processFileUpload } from "../utils/imageHandling";
import { submitGoodsForm } from "../utils/formSubmission";

/**
 * Custom hook for managing the goods form state and handlers
 * 
 * @param onClose Function to close the form dialog
 * @param initialValues Initial values for the form
 * @param initialRequestType Whether this is an offer or request form
 * @returns An object containing form state and handler functions
 */
export const useGoodsForm = ({ 
  onClose, 
  initialValues, 
  initialRequestType 
}: Pick<GoodsFormProps, 'onClose' | 'initialValues' | 'initialRequestType'>) => {
  // Get the current user and query client
  const user = useUser();
  const queryClient = useQueryClient();
  
  // State for the item form (when offering)
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    requestType: initialRequestType,
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  // State for the request form (when requesting)
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    category: (initialValues as any)?.category,
    image: (initialValues as any)?.image
  });
  
  // State for image upload process
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>(
    (initialValues as any)?.category || "furniture"
  );
  
  // Determine whether this is an offer or request form
  const isOfferForm = initialRequestType === "offer";
  
  // Handle adding images to the form data
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("You must be logged in to upload images");
      return;
    }
    
    setUploading(true);
    try {
      const imageUrl = await processFileUpload(e, user.id);
      if (imageUrl) {
        if (isOfferForm) {
          setItemFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrl]
          }));
        } else {
          setRequestFormData(prev => ({
            ...prev,
            image: imageUrl
          }));
        }
      }
    } finally {
      setUploading(false);
    }
  };
  
  // Handle removing an image from the form data
  const handleRemoveImage = (index: number) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index) || []
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        image: null
      }));
    }
  };
  
  // Helper for handling category change to update suggestions
  const handleCategoryChange = (category: GoodsItemCategory) => {
    setSelectedCategory(category);
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        category
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        category
      }));
    }
  };
  
  // Select a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    }
  };
  
  // Handle title change
  const handleTitleChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, title: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, title: value }));
    }
  };
  
  // Handle description change
  const handleDescriptionChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, description: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, description: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a goods request");
      return;
    }
    
    try {
      // Submit the form
      const success = await submitGoodsForm(
        isOfferForm,
        itemFormData,
        requestFormData,
        user.id
      );
      
      if (success) {
        // Update the UI and close the form
        queryClient.invalidateQueries({ queryKey: ['support-requests'] });
        toast.success(isOfferForm ? "Item offered successfully!" : "Item request submitted successfully!");
        onClose();
      }
    } catch (error) {
      console.error('Error submitting goods form:', error);
      toast.error("Failed to submit. Please try again.");
    }
  };
  
  return {
    itemFormData,
    requestFormData,
    uploading,
    selectedCategory,
    isOfferForm,
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleSelectSuggestion,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    setItemFormData,
    setRequestFormData
  };
};
