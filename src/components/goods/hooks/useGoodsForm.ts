
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
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

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
  const neighborhood = useCurrentNeighborhood();
  
  // Determine whether this is an offer or request form
  const isOfferForm = initialRequestType === "offer";
  
  // State for the item form (when offering)
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    // Store the request type as part of the form data
    requestType: initialRequestType || "offer",
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  // State for the request form (when requesting)
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    category: (initialValues as any)?.category || "furniture",
    // Note: We've removed the image field for requests per the user's request
  });
  
  // State for image upload process
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>(
    (initialValues as any)?.category || "furniture"
  );
  
  // Handle adding images to the form data
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Skip for request forms since we've removed image upload for requests
    if (!isOfferForm) return;
    
    if (!user) {
      toast.error("You must be logged in to upload images");
      return;
    }
    
    setUploading(true);
    try {
      const imageUrl = await processFileUpload(e, user.id);
      if (imageUrl) {
        setItemFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      }
    } finally {
      setUploading(false);
    }
  };
  
  // Handle removing an image from the form data
  const handleRemoveImage = (index: number) => {
    // Skip for request forms since we've removed image upload for requests
    if (!isOfferForm) return;
    
    setItemFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };
  
  // Helper for handling category change to update suggestions
  const handleCategoryChange = (category: GoodsItemCategory) => {
    console.log("Category changed to:", category);
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
    // Skip for request forms since we've removed quick suggestions for requests
    if (!isOfferForm) return;
    
    console.log("Selected suggestion:", suggestion);
    setItemFormData(prev => ({
      ...prev,
      title: suggestion
    }));
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
    
    // Debug data being submitted
    if (isOfferForm) {
      console.log("Submitting offer form data:", itemFormData);
    } else {
      console.log("Submitting request form data:", requestFormData);
    }
    
    try {
      // Fix: Pass neighborhood?.id (string) instead of neighborhood (object)
      if (!neighborhood?.id) {
        toast.error("No neighborhood selected");
        return;
      }
      
      // Submit the form with the neighborhood ID (string)
      const success = await submitGoodsForm(
        isOfferForm,
        itemFormData,
        requestFormData,
        user.id,
        neighborhood.id // Pass the ID (string) instead of the whole object
      );
      
      if (success) {
        // Update the UI and close the form
        console.log("Form submission successful, invalidating queries");
        // Update to use the dedicated goods-exchange query key
        queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
        // Removed toast.success here since it's now handled in submitGoodsForm
        onClose();
      }
    } catch (error) {
      console.error('Error submitting goods form:', error);
      // Don't duplicate toast errors - the submitGoodsForm function already shows an error toast
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
