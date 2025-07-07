
// This hook manages the form handlers
import { toast } from "sonner";
import { GoodsCategory } from "../types/goodsFormTypes";
import { processFileUpload, processMultipleFileUploads } from "../utils/imageHandling";

export const useGoodsFormHandlers = (
  isOfferForm: boolean,
  userId: string | undefined,
  setUploading: (value: boolean) => void,
  setItemFormData: any,
  setRequestFormData: any,
  setSelectedCategory: (category: GoodsCategory) => void
) => {
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) {
      toast.error("You must be logged in to upload images");
      return;
    }
    
    setUploading(true);
    try {
      // Use the multiple file upload handler for offer forms (which allow multiple images)
      if (isOfferForm && e.target.files && e.target.files.length > 0) {
        // If multiple files are selected, use processMultipleFileUploads
        const result = await processMultipleFileUploads(e, userId);
        if (result.imageUrls.length > 0) {
          setItemFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...result.imageUrls]
          }));
        }
        // Show error if there was one
        if (result.error) {
          toast.error(result.error);
        }
      } else {
        // For single file uploads (or request forms)
        const result = await processFileUpload(e, userId);
        if (result.imageUrl) {
          if (isOfferForm) {
            setItemFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), result.imageUrl]
            }));
          } else {
            setRequestFormData(prev => ({
              ...prev,
              image: result.imageUrl
            }));
          }
        }
        // Show error if there was one
        if (result.error) {
          toast.error(result.error);
        }
      }
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    if (!isOfferForm) return;
    
    setItemFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };
  
  const handleCategoryChange = (category: GoodsCategory) => {
    console.log("Category changed to:", category);
    setSelectedCategory(category);
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, category }));
    } else {
      setRequestFormData(prev => ({ ...prev, category }));
    }
  };
  
  const handleTitleChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, title: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, title: value }));
    }
  };
  
  const handleDescriptionChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, description: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, description: value }));
    }
  };
  
  return {
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleTitleChange,
    handleDescriptionChange
  };
};
