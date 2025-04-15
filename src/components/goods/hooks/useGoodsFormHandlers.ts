
// This hook manages the form handlers
import { toast } from "sonner";
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import { processFileUpload } from "../utils/imageHandling";

export const useGoodsFormHandlers = (
  isOfferForm: boolean,
  userId: string | undefined,
  setUploading: (value: boolean) => void,
  setItemFormData: any,
  setRequestFormData: any,
  setSelectedCategory: (category: GoodsItemCategory) => void
) => {
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOfferForm) return;
    
    if (!userId) {
      toast.error("You must be logged in to upload images");
      return;
    }
    
    setUploading(true);
    try {
      const imageUrl = await processFileUpload(e, userId);
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
  
  const handleRemoveImage = (index: number) => {
    if (!isOfferForm) return;
    
    setItemFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };
  
  const handleCategoryChange = (category: GoodsItemCategory) => {
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
