
// Main hook that combines all the others
import { useUser } from "@supabase/auth-helpers-react";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useGoodsFormState } from "./useGoodsFormState";
import { useGoodsFormHandlers } from "./useGoodsFormHandlers";
import { useGoodsFormSubmit } from "./useGoodsFormSubmit";
import { GoodsFormProps } from "@/components/support/types/formTypes";

export const useGoodsForm = ({ 
  onClose, 
  initialValues, 
  initialRequestType 
}: Pick<GoodsFormProps, 'onClose' | 'initialValues' | 'initialRequestType'>) => {
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  
  const {
    itemFormData,
    setItemFormData,
    requestFormData,
    setRequestFormData,
    uploading,
    setUploading,
    selectedCategory,
    setSelectedCategory,
    isOfferForm
  } = useGoodsFormState(initialValues, initialRequestType);
  
  const {
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleTitleChange,
    handleDescriptionChange
  } = useGoodsFormHandlers(
    isOfferForm,
    user?.id,
    setUploading,
    setItemFormData,
    setRequestFormData,
    setSelectedCategory
  );
  
  const { handleSubmit } = useGoodsFormSubmit(
    isOfferForm,
    itemFormData,
    requestFormData,
    user?.id,
    neighborhood?.id,
    onClose
  );
  
  return {
    itemFormData,
    requestFormData,
    uploading,
    selectedCategory,
    isOfferForm,
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    setItemFormData,
    setRequestFormData
  };
};
